import {Request, Response, NextFunction} from "express";
import {
    verifyAccessToken,
    verifyRefreshToken,
    generateAccessToken,
    setTokenCookies,
} from "../utils/jwt.js";
import User from "../models/User.js";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken && !refreshToken) {
            res.status(401).json({message: "Authentication required"});
            return;
        }

        if (accessToken) {
            try {
                const decoded = verifyAccessToken(accessToken);
                req.userId = decoded.userId;
                return next();
            } catch (err) {
                throw new Error("Access token expired, try refresh token");
            }
        }

        if (refreshToken) {
            try {
                const decoded = verifyRefreshToken(refreshToken);

                const user = await User.findById(decoded.userId);
                if (!user) {
                    res.status(401).json({message: "User not found"});
                    return;
                }

                const newAccessToken = generateAccessToken(decoded.userId);

                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000,
                });

                req.userId = decoded.userId;
                return next();
            } catch (err) {
                res.status(401).json({message: "Invalid refresh token"});
            }
        }

        res.status(401).json({message: "Authentication required"});
    } catch (err) {
        res.status(500).json({message: "Authentication error"});
    }
};
