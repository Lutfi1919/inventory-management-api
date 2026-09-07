import type { NextFunction, Request, Response } from "express";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.isJoi) {
        const errorMes = error.details.map((detail: any) => detail.message.toString())
        const formattedError = errorMes.toString();

        return res.status(400).json({
            success: false,
            message: "data tidak valid",
            error: formattedError
        })
    }

    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode ? error.message : "Internal server error",
        error: error.message
    });
}