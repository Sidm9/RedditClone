
import { PostResolver } from "src/resolveres/posts";
import { Field, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL TYPEORM
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null;  // If the post has +1 vote status then i personally have voted on it if -1 then i have downvoted on it else null


    @Field()
    @Column()
    creatorId: number;


    // @TypeOrm
    // Many Posts can be uploaded by 1 user
    // In short a Foriegn Key
    @Field()
    @ManyToOne(() => User, (user) => user.posts)
    creator: User;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;



}
