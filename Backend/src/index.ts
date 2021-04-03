import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from "cors";
import "dotenv-safe/config";
import express from 'express';
import session from 'express-session';
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";
import { HelloResolver } from "./resolveres/hello";
import { PostResolver } from "./resolveres/posts";
import { UserResolver } from "./resolveres/user";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {

    const conn = createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot],
    });
    (await conn).runMigrations();

    // await Post.delete({});


    const app = express();

    // REDIS BOILERPLATE FROM DOCS

    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);
    app.set("proxy" , 1) // Tell express that we have a proxy setup so that express does the session and cookie stuff
    
    // LOGIN CORS REQUEST

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore(
                // Touch ttl (How long it should last)
                { client: redis, disableTouch: true, }
            ),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years 
                sameSite: "lax", // CSRF
                httpOnly: true,   //security reasons
                secure: __prod__ // cookie only works in https
                // domain: __prod__ ?  "Add your domain" : undefined
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false,

        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            // CLASS VALIDATIONS
            validate: false,
        }),
        // SPECIAL OBJECT THAT IS ACCESSIBLE TO ALL RESOLVERs
        // WHY ??? COZ WE WANT ORM TO BE ACCESSIBLE FROM THE RESOLVERS

        // Traditional req res from express 
        // Apollo Supports this!!! !
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader()
        })
    })

    app.get('/', (_, res) => {
        res.send("Hello");
    })

    apolloServer.applyMiddleware({ app, cors: false, });

    app.listen(parseInt(process.env.PORT), () => {
        console.log("Server Started on localhost:4000")
    });
    // const post = orm.em.create(Post, { title: 'my First Post' });
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);
}

main().catch((err) => {
    console.log(err);
});