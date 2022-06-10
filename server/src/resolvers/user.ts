import { Resolver, Query, Ctx, UseMiddleware, Arg, Mutation } from "type-graphql"
import { AppDataSource } from "../data-source"
import { isAuthed } from "../decorators"
import { User } from "../entity/User"
import bcrypt from "bcrypt"
// import User from "../entity/User"
import { MyContext, UserResponse } from "../types"
import { sign } from "jsonwebtoken"
import { COOKIE_NAME, JWT_KEY } from "../constants"

@Resolver()
export class UserResolver {
    @Query(() => User)
    @UseMiddleware(isAuthed)
    async me(
        @Ctx() { user, token }: MyContext
    ): Promise<User> {
        return user
    }
    // login with jwt key over header
    @Mutation(() => UserResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { req, res }: MyContext
    ): Promise<UserResponse> {
        var user = await AppDataSource.getRepository(User).findOne({
            where: { email: email },
        });
        if (!user) {
            throw Error("User acocunt not found")
        }
        const valid = await bcrypt.compareSync(password, user.password); // true
        if (!valid) {
            throw Error("incorrect password")
        }
        const token = sign(
            {
                userId: user.id,
            },
            JWT_KEY!
        )
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });
        return {
            user: user,
            token: token
        }
    }
    // register simple account
    @Mutation(() => UserResponse)
    async register(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const hashedPassword = await bcrypt.hashSync(password, 10);
        let user;
        try {
            const result = await AppDataSource
                .getRepository(User)
                .createQueryBuilder("user")
                .insert()
                .values({
                    email: email.replace(" ", ""),
                    password: hashedPassword,
                })
                .returning("*")
                .execute();
            user = result.raw[0];
            var fin_user = await AppDataSource.getRepository(User).findOne({
                where: { id: user.id },
            });
        } catch (error) {
            console.log(error)
            throw Error("erro creating user account")

        }
        return {
            user: fin_user,
            token: sign({ userId: fin_user?.id }, JWT_KEY!),
        }
    }
    @Mutation(() => Boolean)
    async logout(
        @Ctx() { res }
    ): Promise<boolean> {
        res.clearCookie(COOKIE_NAME);
        return true
    }
}
