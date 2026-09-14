import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express.js";

const createAuthError = (statusCode: number, message: string) => {
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = statusCode;
    return error;
};

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header("Authorization");
    const token = authorization?.replace("Bearer ", "");
    if (!token) {
        return next(createAuthError(401, "Unauthorized"));
    }

    try {
        const check = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = check as AuthUser;
        next();
    } catch (error) {
        return next(createAuthError(401, "Unauthorized"));
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(createAuthError(401, "Unauthorized"));
        }

        if (!roles.includes(req.user.role)) {
            return next(createAuthError(403, "Forbidden"));
        }

        next();
    };
};
