import { Schema, model } from "mongoose";
import type { MessageProps } from "../types.js";

/**
 * Message model — stores all chat messages.
 * senderId refs User — populated when returning messages to match
 * the frontend MessageProps.sender shape { id, name, avatar }.
 *
 * seen: array of User ObjectIds who have read this message.
 * timestamps: true → adds createdAt / updatedAt.
 */
const MessageSchema = new Schema<MessageProps>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text",
        },
        attachment: {
            type: String,
        },
        seen: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

export default model<MessageProps>("Message", MessageSchema);
