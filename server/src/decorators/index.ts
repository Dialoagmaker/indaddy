import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { COOKIE_NAME, JWT_KEY } from "../constants";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { MyContext } from "../types";

export const isAuthed: MiddlewareFn<MyContext> = async ({ context }, next) => {
    const authorization = context.req.cookies[COOKIE_NAME]
    // check if auth header is set
    if (!authorization) {
        throw new Error("Auth Err")
    }
    try {
        const payload = verify(authorization, JWT_KEY!)
        const user = await AppDataSource.getRepository(User).find({
            where: {
                id: payload.userId
            },
            // preload everything inside the user context
            // relations: ['photos', 'base_profile', 'user_basic', 'looks', 'personality', 'favourite', 'lifeStyle', 'socialLink'],
        })
        if (user.length == 0) {
            throw new Error("Invalid user")
        }
        context.user = user[0] as any;
    } catch (err) {
        throw new Error("Not Authenticated")
    }
    return next()
}
