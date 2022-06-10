import fs from "fs"
import http from "http"
import { join } from "path"
import bodyParser from "body-parser";
import { User } from "./entity/User"
import { AppDataSource } from "./data-source"
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import { ApolloServer } from "apollo-server-express";
import { pubSub } from "./pubsub";
import { buildSchema } from "type-graphql";
import express, { Express } from "express";
import cookieParser from "cookie-parser"
import { UserResolver } from "./resolvers/user";
import { COOKIE_NAME } from "./constants";
require('dotenv').config()



AppDataSource.initialize().then(async () => {
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    await AppDataSource.manager.save(user)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)


    const app: Express = express();
    app.use(
        graphqlUploadExpress({
            maxFieldSize: 10000000000,
            maxFiles: 10,
        })
    );
    app.use(cookieParser());
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false,
        }),
        context: ({ req, res, connection }) => {
            if (connection) {
                return { ...connection.context };
            } else {
                const token = req?.cookies[COOKIE_NAME];
                return {
                    req,
                    res,
                    pubSub,
                    connection,
                    token,
                };
            }
        },
        playground: true,
        introspection: true,

    })
    app.use(bodyParser.json());

    const httpServer = http.createServer(app);
    app.get(
        ["/"],
        function (_, res) {
            const templatePath = join(__dirname, "/template/index.html");
            fs.readFile(templatePath, "utf-8", (err, content) => {
                if (err) {
                    console.log("can't open file");
                }
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                return res.end(content);
            });
        }
    );

    apolloServer.applyMiddleware({
        app,
        cors: {
            credentials: true,
            origin: "*",
        },
    });
    httpServer.listen(process.env.PORT, () => {
        // apolloServer.installSubscriptionHandlers(httpServer);
        console.log("Express Server Connected");
    });
}).catch(error => console.log(error))
