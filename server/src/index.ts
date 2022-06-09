import fs from "fs"
import path, { join } from "path"
import http from "http"
import { User } from "./entity/User"
import { AppDataSource } from "./data-source"
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import express, { Express } from "express";
import cookieParser from "cookie-parser"
import { CoreResolver } from "./resolvers/core";
require('dotenv').config()



AppDataSource.initialize().then(async () => {
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
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
        // uploads: false,
        schema: await buildSchema({
            resolvers: [CoreResolver],
            // pubSub: pubSub,
            validate: false,
        })
    })
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
