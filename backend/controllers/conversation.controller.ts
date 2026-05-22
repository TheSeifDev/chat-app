import type { Response } from "express";
import type { AuthenticatedRequest } from "../types.js";
import { Types } from "mongoose";
import Conversation from "../models/conversation.model.js";
import User from "../models/User.js";

/**
 * createConversation — POST /conversation
 * Body: { targetUserId: string }
 *
 * Creates a direct 1:1 conversation between the authenticated user and
 * the target user. If one already exists, returns the existing one (idempotent).
 * Populates participants with name/avatar/email for immediate frontend use.
 *
 * Depends on: Conversation model, User model, authMiddleware (req.user)
 */
export const createConversation = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    // Authorization guard: narrow req.user from optional to present
    if (!req.user) {
        res.status(401).json({ success: false, msg: "Unauthorized" });
        return;
    }

    const { targetUserId } = req.body as { targetUserId?: string };
    const userId: string = req.user.id;

    if (!targetUserId) {
        res.status(400).json({ success: false, msg: "targetUserId is required" });
        return;
    }

    // Validate IDs are valid ObjectIds before querying
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(targetUserId)) {
        res.status(400).json({ success: false, msg: "Invalid user id" });
        return;
    }

    try {
        // Verify target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            res.status(404).json({ success: false, msg: "User not found" });
            return;
        }

        // Check if a direct conversation already exists between the two users
        // Convert string ids to ObjectId to satisfy Mongoose's strict filter typing
        const userOId = new Types.ObjectId(userId);
        const targetOId = new Types.ObjectId(targetUserId);

        let conversation = await Conversation.findOne({
            type: "direct",
            participants: { $all: [userOId, targetOId], $size: 2 },
        })
            .populate("participants", "name avatar email")
            .populate("lastMessage");

        if (conversation) {
            res.json({ success: true, data: conversation });
            return;
        }

        // Create new direct conversation
        conversation = await Conversation.create({
            type: "direct",
            participants: [userOId, targetOId],
            createdBy: userOId,
        });

        await conversation.populate("participants", "name avatar email");

        res.status(201).json({ success: true, data: conversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

/**
 * getConversations — GET /conversation
 *
 * Returns all conversations the authenticated user is a participant of,
 * sorted by most recently updated (newest message first).
 * Populates participants and lastMessage for the conversation list UI.
 *
 * Depends on: Conversation model, authMiddleware (req.user)
 */
export const getConversations = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ success: false, msg: "Unauthorized" });
        return;
    }

    const userId: string = req.user.id;

    if (!Types.ObjectId.isValid(userId)) {
        res.status(400).json({ success: false, msg: "Invalid user id" });
        return;
    }

    const userOId = new Types.ObjectId(userId);

    try {
        const conversations = await Conversation.find({
            participants: { $in: [userOId] },
        })
            .populate("participants", "name avatar email")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

/**
 * getConversationById — GET /conversation/:id
 *
 * Returns a single conversation by ID.
 * Verifies the requesting user is a participant (access control).
 *
 * Depends on: Conversation model, authMiddleware (req.user)
 */
export const getConversationById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ success: false, msg: "Unauthorized" });
        return;
    }

    // req.params values are string at runtime in Express.
    // Under strict Express v5 types they are string|string[]|undefined.
    // Guard to string before using in Mongoose queries.
    const rawId = req.params["id"];
    const id = typeof rawId === "string" ? rawId : undefined;
    const userId: string = req.user.id;

    if (!id) {
        res.status(400).json({ success: false, msg: "Conversation id is required" });
        return;
    }

    // Validate ids as ObjectIds to avoid Mongoose cast errors and satisfy type system
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({ success: false, msg: "Invalid id" });
        return;
    }

    const convOId = new Types.ObjectId(id);
    const userOId = new Types.ObjectId(userId);

    try {
        const conversation = await Conversation.findOne({
            _id: convOId,
            participants: { $in: [userOId] },
        })
            .populate("participants", "name avatar email")
            .populate("lastMessage");

        if (!conversation) {
            res.status(404).json({ success: false, msg: "Conversation not found" });
            return;
        }

        res.json({ success: true, data: conversation });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
