import apiClient from "./apiClient";
import type { MessageProps } from "@/types";

/**
 * message.Service.ts
 *
 * Only handles GET (listing messages for history/pagination).
 * Sending messages goes through the socket (sendMessage event)
 * for real-time delivery to all participants.
 */

export const getMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20
): Promise<MessageProps[]> => {
  try {
    const response = await apiClient.get(
      `/message/${conversationId}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  } catch (error: any) {
    const msg = error?.response?.data?.msg || "Failed to fetch messages.";
    throw new Error(msg);
  }
};
