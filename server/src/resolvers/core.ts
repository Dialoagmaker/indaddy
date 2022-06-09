import { Resolver, Query } from "type-graphql"

@Resolver()
export class CoreResolver {
    @Query(() => String)
    async test(
        // @Ctx() { user }: MyContext
    ): Promise<string> {
        return "test"
        // return user;
    }
}