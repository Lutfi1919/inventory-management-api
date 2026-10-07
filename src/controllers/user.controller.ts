import type { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service.ts";
import { AuthService } from "../services/auth.service.ts";
import Joi from "joi";
import bcrypt from "bcrypt";
import { UserRole } from "../types/users_roles.ts";
import { UserStatus } from "../types/users_status.ts";

export class UserController {
    private userService = new UserService();
    private authService = new AuthService();

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

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAllUser();

            return res.status(200).json({
                success: true,
                data: users
            })
        } catch (error) {
            next(error)
        }
    }

    getUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const user = await this.userService.getUserById(id)
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data User dengan ID ${id} tidak ditemukan`
                })
            }

            return res.status(200).json({
                success: true,
                data: user
            })
        } catch (error) {
            next(error)
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
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
                }),
                status: Joi.string().valid(...Object.values(UserStatus)).messages({
                    "string.empty": "status tidak boleh kosong",
                    "any.only": "Enum status salah"
                })
            })

            const value = await schema.validateAsync(userData)

            value.password = await bcrypt.hash(value.password, 10)

            const user = await this.authService.register(value)

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }

            return res.status(201).json({
                success: true,
                message: "Berhasil membuat user",
                data: userResponse
            }) 
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const { ...userData } = req.body;
            
            const schema = Joi.object({
                name: Joi.string().trim().min(3).messages({
                    "string.empty": "name tidak boleh kosong",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "name minimal 3 karakter",
                }),
                email: Joi.string().trim().email({minDomainSegments: 2}).messages({
                    "string.empty": "email tidak boleh kosong",
                    "string.email": "format email tidak valid",
                }),
                password: Joi.string().trim().min(8).messages({
                    "string.empty": "password tidak boleh kosong",
                    "string.min": "password minimal 8 karakter",
                }),
                role: Joi.string().valid(...Object.values(UserRole)).messages({
                    "string.empty": "role tidak boleh kosong",
                    "any.only": "Enum role salah"
                }),
                status: Joi.string().valid(...Object.values(UserStatus)).messages({
                    "string.empty": "status tidak boleh kosong",
                    "any.only": "Enum status salah"
                })
            })

            const value = await schema.validateAsync(userData)

            if (value.password) {
                value.password = await bcrypt.hash(value.password, 10)
            }

            const user = await this.userService.updateUserById(id, value)
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: `Data User dengan ID: ${id} tidak ditemukan`
                })
            }

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }

            return res.status(201).json({ 
                success: true,
                message: "Berhasil meng-update data User", 
                data: userResponse,
            })
        } catch (error) {
            next(error)
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const user = await this.userService.deleteById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: `Data User dengan ID: ${id} tidak ditemukan`
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "Berhasil menghapus data User berdasarkan ID" 
            })
        } catch (error) {
            next(error)
        }
    }
}