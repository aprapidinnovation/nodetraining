import {Router} from "express";
import AuthController from "../controller/AuthController";
import {checkJwt} from "../middlewares/checkJwt";

const router = Router();

router.post("/login", AuthController.login);

router.post("/chang-password", [checkJwt], AuthController.changePassword);

export default router;