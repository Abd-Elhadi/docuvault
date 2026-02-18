import express, {Application} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import {errorHandler} from "./middleware/errorHandler.js";
import {connectDatabase} from "./config/database.js";
import {env} from "./config/env.js";
import helmet from "helmet";

const app: Application = express();

app.use(cookieParser());
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({status: "ok", message: "Server is running"});
});

app.use(errorHandler);

const startServer = async () => {
    try {
        await app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            connectDatabase();
        });
    } catch (err) {
        console.error("Failed to start server: ", err);
        process.exit(1);
    }
};

startServer();
