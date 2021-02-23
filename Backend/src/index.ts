import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from './constants'
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolveres/hello";
import { PostResolver } from "./resolveres/posts";
import { UserResolver } from "./resolveres/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import cors from "cors";


const main = async () => {

    // sendEmail("bob@bob.com" , "helo")
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    // REDIS BOILERPLATE FROM DOCS

    let RedisStore = connectRedis(session)
    let redisClient = redis.createClient()

    // LOGIN CORS REQUEST

    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore(
                // Touch ttl (How long it should last)
                { client: redisClient, disableTouch: true, }
            ),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years 
                sameSite: "lax", // CSRF
                httpOnly: true,   //security reasons
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: 'qpoweioirteirheigruhiur',
            resave: false,

        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            // CLASS VAIDATIONS
            validate: false,
        }),
        // SPECIAL OBJECT THAT IS ACCESSIBLE TO ALL RESOLVERs
        // WHY ??? COZ WE WANT ORM TO BE ACCESSIBLE FROM THE RESOLVERS

        // Traditional req res from express 
        // Apollo Supports this!!! !
        context: ({ req, res }) => ({ em: orm.em, req, res })
    })

    app.get('/', (_, res) => {
        res.send("Hello");
    })

    apolloServer.applyMiddleware({ app, cors: false, });


    app.listen(4000, () => {
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
