import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.ts";
import { limiter } from "../middlewares/rate-limiter.ts";

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', limiter, authController.login);

export default router