import { type Socket, type Server as SocketIoServer } from "socket.io";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

// The allowed message type values — mirrors the Mongoose enum in message.model.ts
type MessageType = "text" | "image" | "file";

/**
 * Narrows a raw string to the MessageType union.
 * Falls back to "text" for any unknown value.
 * Root fix for: Message.create() returning 'never' when type is inferred as string.
 */
function toMessageType(value: string | undefined): MessageType {
    if (value === "image" || value === "file") return value;
    return "text";
}

/**
 * registerMessageEvents — follows exact same pattern as registerUserEvents.
 * Called from soket.ts on every authenticated connection.
 *
 * Events handled:
 *   joinConversation  → socket joins the room
 *   leaveConversation → socket leaves the room
 *   sendMessage       → saves to DB, updates conversation.lastMessage, emits newMessage to room
 *   typing            → broadcasts userTyping to other room members
 *   stopTyping        → broadcasts userStopTyping to other room members
 *   markSeen          → marks message seen in DB, broadcasts messageSeen to room
 */
export function registerMessageEvents(io: SocketIoServer, socket: Socket) {
    // Join a specific conversation room (idempotent — already auto-joined on connect)
    socket.on("joinConversation", (conversationId: string) => {
        socket.join(conversationId);
    });

    // Leave a conversation room
    socket.on("leaveConversation", (conversationId: string) => {
        socket.leave(conversationId);
    });

    // Send a message: persist to DB → update conversation → emit to room
    socket.on(
        "sendMessage",
        async (
            data: { conversationId: string; content: string; type?: string },
            callback?: (result: { success: boolean; data?: unknown; msg?: string }) => void
        ) => {
            try {
                // Narrow string → "text"|"image"|"file" before passing to create()
                // Root fix: without this, TypeScript infers the return type as 'never'
                // because the type field doesn't satisfy the Mongoose enum constraint.
                const messageType: MessageType = toMessageType(data.type);

                const message = await Message.create({
                    conversationId: data.conversationId,
                    senderId: socket.data.userId as string,
                    content: data.content,
                    type: messageType,
                });

                // Update conversation's lastMessage and bump updatedAt
                await Conversation.findByIdAndUpdate(data.conversationId, {
                    lastMessage: message._id,
                    updatedAt: new Date(),
                });

                // Populate sender for emission — cast to populated shape
                await message.populate("senderId", "name avatar");

                const sender = message.senderId as unknown as {
                    _id: { toString(): string };
                    name: string;
                    avatar?: string;
                };

                const messageData = {
                    id: (message._id as { toString(): string }).toString(),
                    conversationId: message.conversationId,
                    sender: {
                        id: sender._id.toString(),
                        name: sender.name,
                        avatar: sender.avatar ?? null,
                    },
                    content: message.content,
                    type: message.type,
                    attachement: message.attachment ?? null,
                    createdAt: message.createdAt,
                };

                // Emit to ALL room members (including sender) — no local optimistic update needed
                io.to(data.conversationId).emit("newMessage", messageData);

                if (typeof callback === "function") {
                    callback({ success: true, data: messageData });
                }
            } catch (error) {
                console.error("Error sending message via socket:", error);
                if (typeof callback === "function") {
                    callback({ success: false, msg: "Failed to send message" });
                }
            }
        }
    );

    // Typing indicator — broadcast to OTHER room members only (not back to self)
    socket.on("typing", (data: { conversationId: string }) => {
        socket.to(data.conversationId).emit("userTyping", {
            userId: socket.data.userId as string,
            name: socket.data.name as string,
            conversationId: data.conversationId,
        });
    });

    // Stop typing
    socket.on("stopTyping", (data: { conversationId: string }) => {
        socket.to(data.conversationId).emit("userStopTyping", {
            userId: socket.data.userId as string,
            conversationId: data.conversationId,
        });
    });

    // Mark a message as seen
    socket.on(
        "markSeen",
        async (data: { messageId: string; conversationId: string }) => {
            try {
                await Message.findByIdAndUpdate(data.messageId, {
                    $addToSet: { seen: socket.data.userId as string },
                });

                socket.to(data.conversationId).emit("messageSeen", {
                    messageId: data.messageId,
                    userId: socket.data.userId as string,
                });
            } catch (error) {
                console.error("Error marking message as seen:", error);
            }
        }
    );
}
