import { Router } from "express";
import { searchUsers } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.get("/search", authMiddleware, searchUsers);

export default router;
