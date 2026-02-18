import {Router} from "express";
import {
    getCurrentUser,
    login,
    logout,
    refreshToken,
    register,
} from "../controllers/authController.js";
import {authenticate} from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getCurrentUser);

export default router;
