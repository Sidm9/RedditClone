import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL MIKRORM
@Entity()
export class User extends BaseEntity {
    @Field() // type-graphql
    @PrimaryGeneratedColumn()
    id!: number;


    @Field() // type-graphql
    // NOTICE THE UNIQUE PROPERTY!
    @Column({ unique: true })
    username!: string;



    @Field() // type-graphql
    // NOTICE THE UNIQUE PROPERTY!
    @Column({ unique: true })
    email!: string;

    // LOOK NO FIELD DECORATOER heRE
    // THIS IS FOR HIDING THE FEILD
    @Column({ })
    password!: string;


    // TypeORM
    // A User Can have Many Posts
    // creator is the FOREIGN KEY 
    @OneToMany(type => Post , post => post.creator)
    posts : Post[] // Array of Posts

    @Field(() => String) // type-graphql
    @CreateDateColumn({ type: "date" })
    createdAt = Date; 


    @Field(() => String) // type-graphql
    @UpdateDateColumn()
    updatedAt = Date;

}