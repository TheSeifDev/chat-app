import apiClient from "./apiClient";

/**
 * user.Service.ts — search only (Phase 2 scope)
 *
 * UserSearchResult defined here (not in global types.ts) because it's
 * specific to this service's API response. Exported for use in the
 * newConversation screen.
 */

export type UserSearchResult = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

export const searchUsers = async (
  query: string
): Promise<UserSearchResult[]> => {
  try {
    const response = await apiClient.get(
      `/user/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data;
  } catch (error: any) {
    const msg = error?.response?.data?.msg || "Failed to search users.";
    throw new Error(msg);
  }
};
