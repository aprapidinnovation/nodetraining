import * as BodyParser from "body-parser";
import * as Cors from "cors";
import * as Express from "express";
import * as Helmet from "helmet";
import { createConnection } from "typeorm";
import routes from "./routes";

createConnection().then(async (connection) => {
    const app = Express();
    app.use(Cors());
    app.use(Helmet());
    app.use(BodyParser.json());

    app.use("/", routes);
    app.listen(1337, "0.0.0.0", () => {
        console.log("Listening to port:  " + 1337);
    });
}).catch((error) => { console.log(error); });
