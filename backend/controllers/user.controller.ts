import type { Response } from "express";
import type { AuthenticatedRequest } from "../types.js";
import { Types } from "mongoose";
import User from "../models/User.js";

/**
 * searchUsers — GET /user/search?q=<query>
 *
 * Returns users whose name or email match the query (case-insensitive).
 * Excludes the requesting user from results.
 * Used by the New Conversation screen to find people to chat with.
 *
 * Depends on: User model, AuthenticatedRequest (req.user.id from authMiddleware)
 */
export const searchUsers = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    // Authorization guard: narrow req.user from optional to present
    if (!req.user) {
        res.status(401).json({ success: false, msg: "Unauthorized" });
        return;
    }

    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
        res.status(400).json({ success: false, msg: "Search query is required" });
        return;
    }

    const userId: string = req.user.id;

    // Convert to ObjectId — satisfies Mongoose's strict filter typing for _id fields
    if (!Types.ObjectId.isValid(userId)) {
        res.status(400).json({ success: false, msg: "Invalid user id" });
        return;
    }

    const userOId = new Types.ObjectId(userId);

    try {
        const users = await User.find({
            _id: { $ne: userOId },
            $or: [
                { name: { $regex: q.trim(), $options: "i" } },
                { email: { $regex: q.trim(), $options: "i" } },
            ],
        })
            .select("name email avatar")
            .limit(20);

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
