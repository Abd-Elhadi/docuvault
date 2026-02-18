import {Request, Response, NextFunction} from "express";

interface ErrorResponse {
    message: string;
    stack?: string;
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    console.error("Error: ", err);

    const response: ErrorResponse = {
        message: err.message || "Internal server error",
    };

    if (process.env.NODE_ENV === "development") response.stack = err.stack;

    res.status(500).json(response);
};
