import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";

@InputType()  
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}
@Resolver()
export class PostResolver {


  @Query(() => [Post])
  // THE CONTEXT PART IN THE INDEX.JS i.e "em"
  // AND @ctx() IS THE DECORATOR FOR CONTEXT
  posts(): Promise<Post[]> {
    return Post.find();
  }

  // THIS POST (19:19) IS NOT AN ARRAY ITS AN OBJECT THIS IS FOR A SINGLE QUERY 
  @Query(() => Post, { nullable: true }) 
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth) // To check wether the user is logged in while creating a post or not
  async createPost
    (@Arg("input") input: PostInput,
      @Ctx() { req }: MyContext): Promise<Post> {
    return Post.create(
      {
        // Without Login Post

        ...input,
        creatorId: req.session.userId
      }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }


  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }


}

