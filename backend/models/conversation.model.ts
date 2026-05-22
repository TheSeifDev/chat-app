import { Schema, model } from "mongoose";
import type { ConversationProps } from "../types.js";

/**
 * Conversation model — direct (1:1) only for this phase.
 * type: "group" is reserved in the schema (matches ConversationProps in types.ts)
 *       but not exposed via APIs yet to keep architecture simple.
 *
 * timestamps: true → adds createdAt and updatedAt automatically,
 * matching the ConversationProps interface.
 */
const ConversationSchema = new Schema<ConversationProps>(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            default: "direct",
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        name: {
            type: String,
        },
        avatar: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default model<ConversationProps>("Conversation", ConversationSchema);
