import { Field, InputType } from "type-graphql";

// INSTEAD OF ADDING MULTIPLE ARGS WE CAN USE CLASS AND USE ITS PROPERTY AS A TYPE
@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
    @Field()
    email: string;
}
