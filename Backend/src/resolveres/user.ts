import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
// INSTEAD OF ADDING MULTIPLE ARGS WE CAN USE CLASS AND USE ITS PROPERTY AS A TYPE
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

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

        
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 2",
                    },
                ],
            }
        }

        if (options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 2",
                    },
                ],
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword });

        try {
            (em as EntityManager).createQueryBuilder
            await em.persistAndFlush(user);
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
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req, res }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: 'that username does not exists'
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password",
                },],
            }
        }

        // SESSION PART req is coming from types.ts as a context
        req.session!.userId = user.id;

        return {
            user,
        }
    }
}