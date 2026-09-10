import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import type { AuthUser } from "../types/express.js";

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const check = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = check as AuthUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}
