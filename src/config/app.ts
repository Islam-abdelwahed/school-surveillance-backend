import express from "express"
import helmet from "helmet"
import {Container} from "../container"


export const createApp=()=>{

    const app = express();

    app.use(express.json());
    app.use(helmet());

    app.use("/api/v1/auth");

    return app;
}