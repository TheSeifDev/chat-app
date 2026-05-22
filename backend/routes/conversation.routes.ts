import { Router } from "express";
import {
    createConversation,
    getConversations,
    getConversationById,
} from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// All conversation routes require authentication
router.get("/", authMiddleware, getConversations);
router.post("/", authMiddleware, createConversation);
router.get("/:id", authMiddleware, getConversationById);

export default router;
