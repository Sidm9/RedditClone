
import { PostResolver } from "src/resolveres/posts";
import { Field, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn , BaseEntity } from "typeorm";

// CONVERTING TO GRAPHQL TYPEEE
@ObjectType()
// NORMAL MIKRORM
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
}
