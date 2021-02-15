import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
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

    @Mutation(() => UserResponse)
    // REGISTER FUNCTION
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2)
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2",
                },],
            }

        if (options.password.length <= 3)
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2",
                },],
            }
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword });

        try {
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

        return { user };
    }


    @Mutation(() => UserResponse)
    // LOGIN FUNCTION
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
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
        return {
            user,
        }
    }
}