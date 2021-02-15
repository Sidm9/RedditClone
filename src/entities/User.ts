import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL MIKRORM
@Entity()
export class User {
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
    @Property({ type: 'text', unique: true })
    username!: string;

    // LOOK NO FIELD DECORATOER heRE
    // THIS IS FOR HIDING THE FEILD
    @Property({ type: 'text' })
    password!: string;



}