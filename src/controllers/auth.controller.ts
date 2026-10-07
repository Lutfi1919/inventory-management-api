import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service.ts";
import Joi from "joi";
import bcrypt from "bcrypt";

export class AuthController {
    private authService = new AuthService();
    
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
                })
            })

            const value = await schema.validateAsync(userData)

            value.password = await bcrypt.hash(value.password, 10)

            const user = await this.authService.register(value)

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email
            }

            return res.status(201).json({
                success: true,
                message: "Berhasil register User",
                data: userResponse
            })
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ...userData } = req.body;

            const schema = Joi.object({
                email: Joi.string().trim().email({minDomainSegments: 2}).required().messages({
                    "string.empty": "email tidak boleh kosong",
                    "string.email": "format email tidak valid",
                    "any.required": "email wajib diisi"
                }),
                password: Joi.string().trim().required().messages({
                    "string.empty": "password tidak boleh kosong",
                    "any.required": "password wajib diisi"
                })
            })

            const value = await schema.validateAsync(userData)

            const result = await this.authService.login(value);
            if (!result) {
                return res.status(400).json({
                    success: false,
                    message: "Email atau Password salah"
                });
            }

            if (result.inactive) {
                return res.status(403).json({
                    success: false,
                    message: "Akun anda dinonaktifkan"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Berhasil login",
                data: {
                    user: {
                        id: result.user!.id,
                        name: result.user!.name,
                        email: result.user!.email,
                        createdAt: result.user!.createdAt,
                        updatedAt: result.user!.updatedAt
                    },
                    token: result.token
                }
            });

        } catch (error) {
            next(error)
        }
    }
}