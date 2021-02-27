import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response , Express } from 'express'
import { Redis } from "ioredis";


export type MyContext = {
    // @ts-ignore
    req: Request & { session: Express.Session }
    res: Response;
    redis: Redis;
};
