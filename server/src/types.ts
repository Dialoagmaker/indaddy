import { Request, Response } from "express";
import { Field, ObjectType } from "type-graphql";
import { User } from "./entity/User";


export type MyContext = {
  req: Request;
  res: Response;
  user: User;
  token: string;
};


@ObjectType()
export class UserResponse {
  @Field(() => String, { nullable: true })
  token?: String;

  @Field(() => User, { nullable: true })
  user?: User | undefined;
}