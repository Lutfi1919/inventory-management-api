import { Router } from "express";
import { UserController } from "../controllers/user.controller.ts";
import { checkToken } from "../middlewares/auth.ts";
import { limiter } from "../middlewares/rate-limiter.ts";

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', limiter, userController.login);

router.get('/me', checkToken, userController.profile);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/create', userController.create);
router.patch('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router