import apiClient from "./apiClient";
import type { ConversationProps } from "@/types";

/**
 * conversation.Service.ts
 *
 * Uses apiClient (shared Axios instance with auto-injected JWT).
 * Follows the same named-export function pattern as auth.Service.ts.
 * All responses use the { success, data } shape from the backend.
 */

export const getConversations = async (): Promise<ConversationProps[]> => {
  try {
    const response = await apiClient.get("/conversation");
    return response.data.data;
  } catch (error: any) {
    const msg = error?.response?.data?.msg || "Failed to fetch conversations.";
    throw new Error(msg);
  }
};

export const createConversation = async (
  targetUserId: string
): Promise<ConversationProps> => {
  try {
    const response = await apiClient.post("/conversation", { targetUserId });
    return response.data.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.msg || "Failed to create conversation.";
    throw new Error(msg);
  }
};

export const getConversationById = async (
  id: string
): Promise<ConversationProps> => {
  try {
    const response = await apiClient.get(`/conversation/${id}`);
    return response.data.data;
  } catch (error: any) {
    const msg = error?.response?.data?.msg || "Failed to fetch conversation.";
    throw new Error(msg);
  }
};
