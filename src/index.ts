import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import {Request, Response} from "express";
import {Routes} from "./routes";
import transferQueue from "./queue/transferQueue";
import * as Queue from 'bee-queue';
import * as fs from 'fs';
import config from './config/config';

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());
    app.use(helmet());
    app.use(express.static('public'))
    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, route.middleware ? route.middleware : [], (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // start express server
    app.listen(3000);
    transferQueue();
    // const transferQueue = new Queue('transferQueue', config.redisConfig);
    // transferQueue.process((job, done) => {
    //     console.log("transferQueue");
    //     console.log(job.data);
    //     done();
    //     return;
    //     let {code, image} = job.data;
    //     // Notify the client via push notification, web socket or email etc.
    //     fs.writeFileSync(`../../public/qr/${code}.png`, image, {encoding: 'base64'});
    //     console.log(job.data)
    //     done();
    // })

    // insert new users for test
    // await connection.manager.save(connection.manager.create(User, {
    //     username: "admin",
    //     password: "admin",
    //     is_admin: true
    // }));

    console.log("Express server has started on port 3000. Open http://localhost:3000/api to see results");

}).catch(error => console.log(error));
