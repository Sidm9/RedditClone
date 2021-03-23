import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

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

    const replacements: any[] = [realLimitPlusOne, req.session.userId];

    let cursorIdx = 3;
    
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }


    //  INNER JOINNING THE USER <--> POST
    //  json_build_object to return a json type of user

    const posts = await getConnection().query(
      `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator,
    ${
      req.session.userId
        ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
        : 'null as "voteStatus"'
    }
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
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
  post(@Arg("id" , () => Int  /* Specifying an integer here by () => */) id: number): Promise<Post | undefined> {
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

