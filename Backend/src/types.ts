import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response , Express } from 'express'


export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    // @ts-ignore
    req: Request & { session: Express.Session }
    res: Response;
};
