import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from './constants'
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolveres/hello";
import { PostResolver } from "./resolveres/posts";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            // CLASS VAIDATIONS
            validate: false,
        }),
        // SPECIAL OBJECT THAT IS ACCESSIBLE TO ALL RESOLVERs
        // WHY ??? COZ WE WANT ORM TO BE ACCESSIBLE FROM THE RESOLVERS
        context: () => ({ em: orm.em })
    })

    app.get('/', (_, res) => {
        res.send("Hello");  
    })

    apolloServer.applyMiddleware({ app });


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
