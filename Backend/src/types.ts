import { Request, Response , Express } from 'express'
import { Redis } from "ioredis";
import { createUserLoader } from './utils/createUserLoader';


export type MyContext = {
    // @ts-ignore
    req: Request & { session: Express.Session }
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader>;
};
