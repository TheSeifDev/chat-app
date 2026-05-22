import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as SoketIoServer, Socket } from "socket.io";
import { registerUserEvents } from "./userEvents.js";
import { registerMessageEvents } from "./messageEvents.js";
import Conversation from "../models/conversation.model.js";

dotenv.config();

export function initailzeSocket(server: any): SoketIoServer {
  const io = new SoketIoServer(server, {
    cors: {
      origin: "*",
    },
  });


  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error"));
        }

        let userData = decoded.user;
        socket.data = userData;
        socket.data.userId = userData.id;
        next();
      },
    );
  });


  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} , username: ${socket.data.name}`);

    // Auto-join all conversation rooms so the user receives newMessage
    // events even when not actively in the chat screen (e.g. home screen)
    try {
      const conversations = await Conversation.find(
        { participants: { $in: [userId] } },
        "_id"
      );
      conversations.forEach((conv) => {
        socket.join(conv._id.toString());
      });
    } catch (err) {
      console.error("Error auto-joining conversation rooms:", err);
    }

    registerUserEvents(io, socket);
    registerMessageEvents(io, socket);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId} , username: ${socket.data.name}`);
    });
  });

  return io;
}
