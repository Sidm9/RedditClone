import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL MIKRORM
@Entity()
export class Post {
    @Field() // this is too a graphql Decorator...
    @PrimaryKey()
    id!: number;


    @Field(() => String) // this is too a graohql Decorator...
    @Property({ type: "date" })
    createdAt = new Date();


    @Field(() => String) // this is too a graohql Decorator...
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();


    @Field() // this is too a graohql Decorator...
    @Property({ type: 'text' })
    title!: string;

}