import { ConversationProps } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import {
  getConversations as fetchConversationsAPI,
  createConversation as createConversationAPI,
} from "@/services/conversation.Service";

/**
 * ConversationContext
 *
 * Follows the exact same pattern as authContext.tsx:
 *   - createContext with default values
 *   - Provider component with useState
 *   - useConversations hook for consumption
 *
 * Does NOT auto-fetch on mount — the home screen calls fetchConversations()
 * via useFocusEffect so the list refreshes whenever the screen comes into view.
 *
 * addOrUpdateConversation is used by:
 *   - createConversation (adds new conversation to list immediately)
 *   - Future: real-time newMessage handler to update lastMessage on the list
 */

type ConversationContextProps = {
  conversations: ConversationProps[];
  isLoading: boolean;
  fetchConversations: () => Promise<void>;
  createConversation: (targetUserId: string) => Promise<ConversationProps>;
  addOrUpdateConversation: (conversation: ConversationProps) => void;
};

export const ConversationContext = createContext<ConversationContextProps>({
  conversations: [],
  isLoading: false,
  fetchConversations: async () => {},
  createConversation: async () => ({} as ConversationProps),
  addOrUpdateConversation: () => {},
});

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConversationsAPI();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (
    targetUserId: string
  ): Promise<ConversationProps> => {
    const conversation = await createConversationAPI(targetUserId);
    // Immediately add to list so home screen reflects the new conversation
    addOrUpdateConversation(conversation);
    return conversation;
  };

  /**
   * Upsert a conversation in state.
   * If it exists (by _id) → update it (e.g. new lastMessage).
   * If not → prepend to list (most recent first).
   */
  const addOrUpdateConversation = (conversation: ConversationProps) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conversation._id);
      if (exists) {
        return prev.map((c) =>
          c._id === conversation._id ? conversation : c
        );
      }
      return [conversation, ...prev];
    });
  };

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        isLoading,
        fetchConversations,
        createConversation,
        addOrUpdateConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversations = () => useContext(ConversationContext);
