import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config";

export const userMiddleware = (req: Request, res: Response , next: NextFunction ) => {
    const header = req.headers["authorization"]
    try {
        const verify = jwt.verify(header as string, JWT_SECRET)
        // @ts-ignore
        req.userId = verify.id
        next()
    } catch (err) {
        res.status(403).json({
            ErrorMessage: 'You are not logged In'
        })
    }
}