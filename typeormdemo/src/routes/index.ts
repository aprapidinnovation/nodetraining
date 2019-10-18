import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import forget from "./forget";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/forget", forget)

export default routes;