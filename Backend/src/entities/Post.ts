
import { PostResolver } from "src/resolveres/posts";
import { Field, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL TYPEORM
@Entity()
export class Post extends BaseEntity {
    @Field() // Type-graphql
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @Column()
    title!: string;


    @Field()
    @Column()
    text!: string;
  
    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoot: Updoot[];


    // Updoots
    @Field()
    @Column({ type: "int", default: 0 })
    points!: string;    

    // Id of that post
    @Field()
    @Column()
    creatorId: number;

    // @TypeOrm
    // Many Posts can be uploaded by 1 user
    // In short a Foriegn Key
    @Field()
    @ManyToOne(() => User, (user) => user.posts)
    creator: User;
    
}
