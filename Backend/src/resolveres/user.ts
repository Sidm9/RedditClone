import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { getConnection } from "typeorm";
@ObjectType()
// If something is wrong with the field
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

// OBJECT TYPE IS USED FOR RETURNS
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);  // 
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired",
                    },
                ],
            };
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);// REDIS USES STRINGS AND WE ARE USING ID TYPE 

        // THIS IS THE EDDGE CASE (TOKEN COULD BE DELETED OR USER COULD TAMPER WITH IT WHICH IS NOT GOOD)
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists",
                    },
                ],
            };
        }

        await User.update(
            { id: userIdNum },
            {
                password: await argon2.hash(newPassword),
            }
        );

        await redis.del(key);

        // log in user after change password
        req.session.userId = user.id;

        return { user };
    }


    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext // REDIS CONTEXT HERE FOR TOKEN SESSION
    ) {
        const user = await User.findOne({ where: { email } });

        if (!user) {

            // Email is not in the database
            return true;

        }
        console.log("RUNNNNNNNNNNNNNNNNNN");
        const token: string = v4(); // Random String

        // PREFIX IS GENERALLY USED FOR IDENTIFYING 

        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24 * 3); // Expiry for 3 Days


        await sendEmail( // From the nodemailer 
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        );// Generate a TOKEN FROM THE REDIS AND THAT WILL REFERENCEE TO THE USER WHO WANTS TO CHANGE THE PASS

        return true;
    }


    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        // You are not logged in1f
        if (!req.session.userId) {
            return null
        }
        return User.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    // REGISTER FUNCTION
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {


        const errors = validateRegister(options);
        if (errors) return { errors };


        const hashedPassword = await argon2.hash(options.password);


        let user;
        try {
            // INSERTING TO TYPEORM

            // THe short method
            // User.create({}.save())
            // Long method using query builder
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning("*")
                .execute(); // returning everything!!
            user = result.raw[0];

            // line 88 is doing the same thing as line below 
            // await em.persistAndFlush(user);


        } catch (err) {
            // CODE OF DUPLICATE USERNAME ERROR
            if (err.code === '23505') {
                //|| err.detail.includes("already exists")
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already taken'
                    }]
                }

            }
            console.log("message : ", err);
        }
        console.log("I AM USER COMING FROM RESOLVER: ", user)
        // Store user id session 
        // THis will keep a cookie on the user
        // keep them logged in 
        req.session.userId = "user.id";


        return { user };


    }


    @Mutation(() => UserResponse)
    // LOGIN FUNCTION
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes("@")
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } }
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "that username doesn't exist",
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }

    //Logout
    @Mutation(() => Boolean)

    logout(@Ctx() { req, res /* res for clearing the cookie */ }: MyContext) {

        return new Promise(resolve => req.session.destroy((err: any) => { // Remove the session for redis

            res.clearCookie(COOKIE_NAME);  // Clearing Cookie 

            if (err) { // If a problem occours
                resolve(false);
                return
            }
            resolve(true) // Logout Successfull

        }))
    }

}