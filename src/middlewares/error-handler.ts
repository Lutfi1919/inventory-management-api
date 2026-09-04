import type { NextFunction, Request, Response } from "express";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.isJoi) {
        return res.status(400).json({
            success: false,
            message: "data tidak valid",
            error: error.details.map((detail: any) => detail.message)
        })
    }

    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode ? error.message : "Internal server error",
        error: error.message
    });
}