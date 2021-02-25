import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
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
        @Ctx() { redis, em, req }: MyContext
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

        const user = await em.findOne(User, { id: parseInt(userId) }); // REDIS USES STRINGS AND WE ARE USING ID TYPE 

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

        user.password = await argon2.hash(newPassword);
        await em.persistAndFlush(user); // REGULAR HASHING

        await redis.del(key); // DELETING PREVIOUS KEY

        // LOGIN USER WITH NEW ID 
        req.session.userId = user.id;


        // RETURN TYPE
        return { user };
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { em, redis }: MyContext // REDIS CONTEXT HERE FOR TOKEN SESSION
    ) {
        const user = await em.findOne(User, { email })

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
    async me(
        @Ctx() { req, em }: MyContext

    ) {
        console.log(req.session);
        console.log
        // You are not logged in1
        if (!req.session.userId) {
            return null
        }
        const user = await em.findOne(User, { id: req.session!.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    // REGISTER FUNCTION
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {


        const errors = validateRegister(options);
        if (errors) return { errors };


        const hashedPassword = await argon2.hash(options.password);

        // LINE 85 IS ORM PART
        //const user = em.create(User, { username: options.username, password: hashedPassword });

        let user;
        try {
            // TypeCasting to EntityManager (QUERYBUILDER)
            // This is alternative to persistandFlush
            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert(
                    {
                        username: options.username,
                        password: hashedPassword,
                        created_at: new Date(),
                        email: options.email,
                        updated_at: new Date(),
                    }
                ).returning("*"); // returning everything!!
            user = result[0];

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
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req, res }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User,
            usernameOrEmail.includes("@") ?
                { email: usernameOrEmail } :
                { username: usernameOrEmail }
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: 'That Username does not exists'
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "Incorrect password",
                },],
            }
        }

        // SESSION PART req is coming from types.ts as a context
        req.session!.userId = user.id;

        return {
            user,
        }
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