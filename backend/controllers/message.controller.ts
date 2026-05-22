import type { Response } from "express";
import type { AuthenticatedRequest } from "../types.js";
import { Types } from "mongoose";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

/**
 * getMessages — GET /message/:conversationId?page=1&limit=20
 *
 * Returns paginated messages for a conversation.
 * Sorted descending (newest first) — the frontend FlatList is inverted,
 * so this order displays correctly without client-side reversal.
 *
 * Verifies the requesting user is a conversation participant before returning data.
 * Transforms Mongoose documents to match the frontend MessageProps type shape.
 *
 * Depends on: Message model, Conversation model, authMiddleware (req.user)
 */
export const getMessages = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    // Authorization guard: narrow req.user from optional to present
    if (!req.user) {
        res.status(401).json({ success: false, msg: "Unauthorized" });
        return;
    }

    // req.params values are string at runtime in Express.
    // Under strict Express v5 types they are string|string[]|undefined.
    // Guard to string before using in Mongoose queries.
    const rawConversationId = req.params["conversationId"];
    const conversationIdStr = typeof rawConversationId === "string" ? rawConversationId : undefined;
    const userId: string = req.user.id;

    if (!conversationIdStr) {
        res.status(400).json({ success: false, msg: "conversationId is required" });
        return;
    }

    // Validate IDs as ObjectIds — satisfies Mongoose strict filter typing
    // and prevents runtime CastErrors.
    if (!Types.ObjectId.isValid(conversationIdStr) || !Types.ObjectId.isValid(userId)) {
        res.status(400).json({ success: false, msg: "Invalid id" });
        return;
    }

    const conversationOId = new Types.ObjectId(conversationIdStr);
    const userOId = new Types.ObjectId(userId);

    const pageStr = req.query["page"];
    const limitStr = req.query["limit"];
    const page = typeof pageStr === "string" ? parseInt(pageStr, 10) : 1;
    const limit = typeof limitStr === "string" ? parseInt(limitStr, 10) : 20;
    const skip = (page - 1) * limit;

    try {
        // Access control: user must be a participant
        // Both _id and participants use ObjectId — satisfies Mongoose strict filter types.
        const conversation = await Conversation.findOne({
            _id: conversationOId,
            participants: { $in: [userOId] },
        });

        if (!conversation) {
            res.status(403).json({ success: false, msg: "Access denied" });
            return;
        }

        const messages = await Message.find({
            conversationId: conversationOId,
        })
            .populate("senderId", "name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Transform to match frontend MessageProps shape
        const data = messages.map((msg) => {
            // senderId is populated — cast to the populated shape
            const sender = msg.senderId as unknown as {
                _id: { toString(): string };
                name: string;
                avatar?: string;
            };

            return {
                id: (msg._id as { toString(): string }).toString(),
                conversationId: msg.conversationId,
                sender: {
                    id: sender._id.toString(),
                    name: sender.name,
                    avatar: sender.avatar ?? null,
                },
                content: msg.content,
                type: msg.type,
                attachement: msg.attachment ?? null,
                seen: msg.seen,
                createdAt: msg.createdAt,
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
