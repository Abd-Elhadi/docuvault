import jwt, {SignOptions} from "jsonwebtoken";

import {Response} from "express";

interface TokenPayload {
    userId: string;
}

export const generateAccessToken = (userId: string): string => {
    const payload: TokenPayload = {userId};
    const secret = process.env.JWT_ACCESS_SECRET as string;

    const options: SignOptions = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any,
    };

    return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (userId: string): string => {
    const payload: TokenPayload = {userId};
    const secret = process.env.JWT_REFRESH_SECRET as string;

    const options: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
    };
    return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string,
    ) as TokenPayload;
};

export const verifyRefreshToken = (toekn: string): TokenPayload => {
    return jwt.verify(
        toekn,
        process.env.JWT_REFRESH_SECRET as string,
    ) as TokenPayload;
};

export const setTokenCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string,
): void => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const clearTokenCookies = (res: Response): void => {
    res.cookie("accessToken", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.cookie("refreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
    });
};
