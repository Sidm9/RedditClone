import path from "path";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default async function conn() {
    const conn = await createConnection({
        type: "postgres",
        host: "localhost",
        database: 'lireddit2',
        port: 5432,
        username: "postgres",
        password: "root",
      //  logging: true,
        migrations:[path.join(__dirname, "./migrations/*")], // FOr the fake posts miggrations that are created and join for connecting the path
        synchronize: true,
        entities: [Post, User]
    });

   //await Post.delete({});
    
    conn.runMigrations();
    
}