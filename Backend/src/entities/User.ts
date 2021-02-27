import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL MIKRORM
@Entity()
export class User extends BaseEntity {
    @Field() // type-graphql
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String) // type-graphql
    @CreateDateColumn({ type: "date" })
    createdAt = Date; 


    @Field(() => String) // type-graphql
    @UpdateDateColumn()
    updatedAt = Date;


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



}