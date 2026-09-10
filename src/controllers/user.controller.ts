import type { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service.ts";
import Joi from "joi";
import bcrypt from "bcrypt";
import { UserRole } from "../types/users_roles.ts";

export class UserController {
    private userService = new UserService();

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ...userData } = req.body;

            const schema = Joi.object({
                name: Joi.string().trim().min(3).required().messages({
                    "string.empty": "name tidak boleh kosong",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "name minimal 3 karakter",
                    "any.required": "name wajib diisi"
                }),
                email: Joi.string().trim().email({minDomainSegments: 2}).required().messages({
                    "string.empty": "email tidak boleh kosong",
                    "string.email": "format email tidak valid",
                    "any.required": "email wajib diisi"
                }),
                password: Joi.string().trim().min(8).required().messages({
                    "string.empty": "password tidak boleh kosong",
                    "string.min": "password minimal 8 karakter",
                    "any.required": "password wajib diisi"
                }),
                role: Joi.string().valid(...Object.values(UserRole)).messages({
                    "string.empty": "role tidak boleh kosong",
                    "any.only": "Enum role salah"
                })
            })

            const value = await schema.validateAsync(userData)

            value.password = await bcrypt.hash(value.password, 10)

            const user = await this.userService.register(value)

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email
            }

            return res.status(201).json({
                success: true,
                message: "berhasil register user",
                data: userResponse
            })
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const result = await this.userService.login(email, password);
            if (!result) {
                return res.status(401).json({
                    success: false,
                    message: "email atau password salah"
                });
            }

            return res.status(200).json({
                success: true,
                message: "berhasil login",
                data: result
            });

        } catch (error) {
            next(error)
        }
    }

    profile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user!.id
            const user = await this.userService.profile(id)
            
            return res.status(200).json({
                success: true,
                data: user
            })
        } catch (error) {
            next(error)
        }
    }
}