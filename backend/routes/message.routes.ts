import { Router } from "express";
import { getMessages } from "../controllers/message.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// All message routes require authentication
router.get("/:conversationId", authMiddleware, getMessages);

export default router;
