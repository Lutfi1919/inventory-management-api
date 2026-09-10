import { Router } from "express";
import { UserController } from "../controllers/user.controller.ts";
import { checkToken } from "../middlewares/auth.ts";

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', checkToken, userController.profile);

export default router