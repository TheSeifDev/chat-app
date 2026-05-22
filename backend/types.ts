import { Document , Types } from "mongoose";
import type { Request } from "express";

export interface UserProps extends Document {
    email: string;
    password: string;
    name?: string;
    avatar?: string;
    createdAt?: string;
}

export interface ConversationProps extends Document {
    _id: Types.ObjectId;
    type: "direct" | "group";
    name?: string;
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    createdBy?: Types.ObjectId;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessageProps extends Document {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    type: "text" | "image" | "file";
    attachment?: string;
    seen: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

// Extends Express Request with the decoded JWT user payload
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
    };
}