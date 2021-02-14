import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {


    @Query(() => [Post])
    // THE CONTEXT PART IN THE INDEX.JS i.e "em"
    // AND @ctx() IS THE DECORATOR FOR COTEXT
    posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        // RETURNING THE POSTS FROM THE ORM
        // THIS IS DESTRUCTURED ...
        return em.find(Post, {});
    }

    // THIS POST (19:19) IS NOT AN ARRAY ITS AN OBJECT THIS IS FOR A SINGLE QUERY 
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number,

        @Ctx() { em }: MyContext): Promise<Post | null> {

        return em.findOne(Post, { id });
    }


    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,

        @Ctx() { em }: MyContext): Promise<Post | null> {

        const post = em.create(Post, { title });
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string,

        @Ctx() { em }: MyContext): Promise<Post | null> {

        const post = await em.create(Post, { id });
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post;
    }


    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,

        @Ctx() { em }: MyContext): Promise<Boolean> {

        await em.nativeDelete(Post, { id });
        return true;
    }


}

