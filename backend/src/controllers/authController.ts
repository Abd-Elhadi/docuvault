import {Request, Response} from "express";
import User from "../models/User.js";
import {
    validateEmail,
    validatePassword,
    validateName,
} from "../utils/validators.js";
import {
    generateAccessToken,
    generateRefreshToken,
    setTokenCookies,
    clearTokenCookies,
} from "../utils/jwt.js";
import {AuthRequest} from "../middleware/auth.js";
import {json} from "node:stream/consumers";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password, name} = req.body;

        if (!email || !password || !name) {
            res.status(400).json({message: "All fields are required"});
            return;
        }

        if (!validateEmail(email)) {
            res.status(400).json({message: "Invalid email format"});
            return;
        }

        const passwordValidation = validatePassword(password);

        if (!passwordValidation.valid) {
            res.status(400).json({message: passwordValidation.message});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
            res.status(400).json({message: nameValidation.message});
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            res.status(400).json({message: "User already exists"});
            return;
        }

        const user = await User.create({email, password: hashedPassword, name});

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (err) {
        console.error("Register error: ", err);
        res.status(500).json({message: "Registration failed"});
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            res.status(400).json({message: "Email and password are required"});
            return;
        }

        const user = await User.findOne({email}).select("+password");
        if (!user) {
            res.status(401).json({message: "Invalid email"});
            return;
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({message: "Invalid password"});
            return;
        }

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: "Login successfull",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (err) {
        console.error("Login error: ", err);
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        clearTokenCookies(res);
        res.status(200).json({message: "Logout successfull"});
    } catch (err) {
        console.error("Logout error: ", err);
        res.status(500).json({message: "Logout failed"});
    }
};

export const getCurrentUser = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({message: "User not found"});
            return;
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                storageUsed: user.storageUsed,
            },
        });
    } catch (err) {
        console.error("Get current user error: ", err);
        res.status(500).json({message: "Failed to get user"});
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({message: "Refresh token required"});
            return;
        }

        res.status(200).json({message: "Token refreshed"});
    } catch (err) {
        console.error("Refresh token error: ", err);
        res.status(500).json({message: "Token refresh failed"});
    }
};
