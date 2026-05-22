import { getSocket } from "./socket";

/**
 * socketEvents.ts — socket event helper functions.
 *
 * Pattern (preserved from original):
 *   - Each function gets the socket via getSocket() singleton
 *   - Emit functions call socket.emit(event, payload)
 *   - Listener functions call socket.on / socket.off
 *   - If socket is null (not connected), calls silently fail
 *
 * Original testSocket function is UNCHANGED.
 * New helpers added below it for messages, typing, and seen status.
 */

// ─────────────────────────────────────────────
// ORIGINAL — preserved exactly as written
// ─────────────────────────────────────────────

export const testSocket = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    socket.off("testSocket", payload);
  } else if (typeof payload == "function") {
    socket.on("testSocket", payload);
  } else {
    socket.emit("testSocket", payload);
  }
};

// ─────────────────────────────────────────────
// CONVERSATION ROOM
// ─────────────────────────────────────────────

/** Explicitly join a conversation room (idempotent — users auto-join on connect) */
export const joinConversation = (conversationId: string) => {
  const socket = getSocket();
  socket?.emit("joinConversation", conversationId);
};

/** Leave a conversation room (optional — users stay joined for home-screen updates) */
export const leaveConversation = (conversationId: string) => {
  const socket = getSocket();
  socket?.emit("leaveConversation", conversationId);
};

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

/** Emit a new message — server saves to DB and broadcasts newMessage to the room */
export const sendMessage = (data: {
  conversationId: string;
  content: string;
  type?: string;
}) => {
  const socket = getSocket();
  socket?.emit("sendMessage", data);
};

/** Subscribe to incoming messages */
export const onNewMessage = (callback: (message: any) => void) => {
  const socket = getSocket();
  socket?.on("newMessage", callback);
};

/** Unsubscribe from incoming messages (call in useEffect cleanup) */
export const offNewMessage = (callback: (message: any) => void) => {
  const socket = getSocket();
  socket?.off("newMessage", callback);
};

// ─────────────────────────────────────────────
// TYPING INDICATORS
// ─────────────────────────────────────────────

/** Emit that the current user is typing */
export const emitTyping = (conversationId: string) => {
  const socket = getSocket();
  socket?.emit("typing", { conversationId });
};

/** Emit that the current user stopped typing */
export const emitStopTyping = (conversationId: string) => {
  const socket = getSocket();
  socket?.emit("stopTyping", { conversationId });
};

/** Subscribe to other users' typing events */
export const onUserTyping = (
  callback: (data: {
    userId: string;
    name: string;
    conversationId: string;
  }) => void
) => {
  const socket = getSocket();
  socket?.on("userTyping", callback);
};

export const offUserTyping = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket?.off("userTyping", callback);
};

/** Subscribe to other users' stop-typing events */
export const onUserStopTyping = (
  callback: (data: { userId: string; conversationId: string }) => void
) => {
  const socket = getSocket();
  socket?.on("userStopTyping", callback);
};

export const offUserStopTyping = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket?.off("userStopTyping", callback);
};

// ─────────────────────────────────────────────
// SEEN STATUS
// ─────────────────────────────────────────────

/** Mark a message as seen */
export const emitMarkSeen = (data: {
  messageId: string;
  conversationId: string;
}) => {
  const socket = getSocket();
  socket?.emit("markSeen", data);
};

/** Subscribe to messageSeen events from other participants */
export const onMessageSeen = (
  callback: (data: { messageId: string; userId: string }) => void
) => {
  const socket = getSocket();
  socket?.on("messageSeen", callback);
};

export const offMessageSeen = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket?.off("messageSeen", callback);
};