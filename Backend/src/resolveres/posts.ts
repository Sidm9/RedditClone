import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}


@Resolver(Post) // Post is what we are resolving!!
export class PostResolver {

  @FieldResolver(() => String)
  // This is used to shorten the data (The TEXT part of post) 
  textSnippet(@Root() post: Post) {
    {
      return post.text.slice(0, 50);
    }
  }
  // WHy this?
  // Previous method returned everything 
  // THe inner join part
  // That basically damps the graphql part
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }
  // Only for the updoot part didnt create an seperate File for this
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    update updoot
    set value = $1
    where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    insert into updoot ("userId", "postId", value)
    values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
    update post
    set points = points + $1
    where id = $2
      `,
          [realValue, postId]
        );
      });
    }
    return true;
  }


  @Query(() => PaginatedPosts) // THE CLASSSSS
  //  @ctx() IS THE DECORATOR FOR CONTEXT
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String /* When setting nullable we need to set explict types */
      , { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {

    // Maximum Posts limit.
    const realLimit = Math.min(50, limit);

    /* 20 Post inital + 1 as extra so if 100 posts and 101 fetches which 
     Will be false */
    const realLimitPlusOne = realLimit + 1

    const replacements: any[] = [realLimitPlusOne];


    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }


    //  INNER JOINNING THE USER <--> POST
    //  json_build_object to return a json type of user

    const posts = await getConnection().query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    // Dont know what is going wrong with typeorm so back to raw queries

    // TYPEORM QUERY BUILDER
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect(
    //     "p.creator",
    //     "creator",
    //     `u.id = p."creatorid"`
    // )
    // Need to specify where it the createdAt is at *Post* or at *User*
    // .orderBy('p."createdAt"', "DESC") // Wrapped in single quotes so that it sends in double quotes (INCLUDED)!

    // .take(realLimitPlusOne); // FOR PAGINATION TAKE IS PREFFEERD ELSE LIMIT() CAN BE USED TOO (CHECK QUERYBUILDER DOCS)

    // if (cursor) {
    //   qb.where('"createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  // return Post.find(); // Simple method of  fetching all posts (BEFORE PAGINATION)


  // THIS POST (19:19) IS NOT AN ARRAY ITS AN OBJECT THIS IS FOR A SINGLE QUERY 
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int  /* Specifying an integer here by () => */) id: number): Promise<Post | undefined> {
    // Need Creator along with the Post 

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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext

  ): Promise<Post | null> {

    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*") // Return the post that we update
      .execute();
    return result.raw[0];

  }


  @Mutation(() => Boolean)
  @UseMiddleware(isAuth) // Before delete Check weather user is logged in or not
  async deletePost(
    @Arg("id", () => Int /* Typecasting to Int */)
    id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {

    // NON CASCADE WAY !!!!


    // const post = await Post.findOne(id)
    // if (!post) {
    //   return false;
    // }
    // // If post is not of the user who has creator then 
    // if (post?.creatorId !== req.session.userId) {
    //   throw new Error("Not authorized ")
    // }

    // await Updoot.delete({ postId: id }); // Updooot has also the data of post so first updoot will be deleted first
    // await Post.delete({ id });


    // THE CASCADE WAY (SEE UPDOOT ENTITY)
    await Post.delete({ id, creatorId: req.session.userId });

    return true;
  }

}

