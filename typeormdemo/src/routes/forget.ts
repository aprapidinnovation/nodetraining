import{Router} from "express"
import UserController from "../controller/UserController";


const router = Router();

//forget password
router.post("/", UserController.forgetPassword);

export default router;

