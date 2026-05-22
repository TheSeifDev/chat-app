import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { initailzeSocket } from "./socket/soket.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/conversation", conversationRoutes);
app.use("/user", userRoutes);
app.use("/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);


initailzeSocket(server);

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log("Server is running on port ", PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
