import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import Avatar from "@/components/Avatar";
import MessageBubble from "@/components/MessageBubble";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { getMessages } from "@/services/message.Service";
import {
  onNewMessage,
  offNewMessage,
  onUserTyping,
  offUserTyping,
  onUserStopTyping,
  offUserStopTyping,
  emitTyping,
  emitStopTyping,
  sendMessage,
} from "@/socket/socketEvents";
import type { MessageProps } from "@/types";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import Loading from "@/components/Loading";

/**
 * ConversationScreen — real-time chat screen.
 *
 * Route params (passed from ConversationListItem or newConversation):
 *   id     → conversation ObjectId
 *   name   → display name (other participant for direct chats)
 *   avatar → avatar URI string (may be empty)
 *
 * Data flow:
 *   1. On mount: loadMessages() → GET /message/:id (REST, paginated, newest-first)
 *   2. Socket listeners registered: newMessage, userTyping, userStopTyping
 *   3. Send: emits "sendMessage" via socket → server saves to DB →
 *            server emits "newMessage" to room → caught by onNewMessage listener
 *   4. On unmount: removes listeners (does NOT leave socket room —
 *      users stay in all rooms to receive newMessage on the home screen)
 *
 * The FlatList is inverted so newest messages appear at the bottom.
 * Messages returned from the API are already sorted descending (newest first),
 * which works correctly with inverted FlatList.
 *
 * Typing indicator: emitTyping on text change, auto-stop after 1.5s of silence.
 */
const ConversationScreen = () => {
  const { id, name, avatar } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
  }>();

  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadMessages();

    // ── Socket Listeners ──
    const handleNewMessage = (message: MessageProps) => {
      // Prepend because FlatList is inverted (newest at bottom = index 0)
      setMessages((prev) => [message, ...prev]);
    };
    onNewMessage(handleNewMessage);

    const handleTyping = (data: {
      userId: string;
      name: string;
      conversationId: string;
    }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) =>
          prev.includes(data.userId) ? prev : [...prev, data.userId]
        );
      }
    };
    onUserTyping(handleTyping);

    const handleStopTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      setTypingUsers((prev) => prev.filter((uid) => uid !== data.userId));
    };
    onUserStopTyping(handleStopTyping);

    // Cleanup: remove listeners only — do NOT leave the room.
    // Users stay joined to all their rooms so newMessage events
    // keep arriving when they navigate to the home screen.
    return () => {
      offNewMessage(handleNewMessage);
      offUserTyping(handleTyping);
      offUserStopTyping(handleStopTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [id, user?.id]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await getMessages(id);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    emitTyping(id);
    // Reset the stop-typing debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(id);
    }, 1500);
  };

  const handleSend = () => {
    const text = messageText.trim();
    if (!text || isSending) return;

    setMessageText("");
    setIsSending(true);
    emitStopTyping(id);

    // Emit to socket — server saves, then broadcasts newMessage to room
    sendMessage({ conversationId: id, content: text });
    setIsSending(false);
  };

  const renderMessage = useCallback(
    ({ item }: { item: MessageProps }) => (
      <MessageBubble message={item} isMe={item.sender.id === user?.id} />
    ),
    [user?.id]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScreenWrapper showPattern={true} bgOpacity={0.3}>
        <View style={styles.container}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <BackButton iconSize={24} />
            <View style={styles.headerCenter}>
              <Avatar uri={avatar || null} size={38} />
              <Typo
                size={16}
                fontWeight="600"
                color={colors.white}
                style={{ marginLeft: spacingX._10 }}
              >
                {name}
              </Typo>
            </View>
            <View style={{ width: 30 }} />
          </View>

          {/* ── Message List ── */}
          <View style={styles.messagesContainer}>
            {isLoading ? (
              <Loading />
            ) : (
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                inverted
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messageList}
                ListHeaderComponent={
                  // In inverted list, ListHeaderComponent appears at the BOTTOM
                  typingUsers.length > 0 ? (
                    <View style={styles.typingIndicator}>
                      <Typo size={12} color={colors.neutral400}>
                        {name} is typing...
                      </Typo>
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <View style={styles.emptyMessages}>
                    <Icons.ChatTeardrop
                      size={verticalScale(48)}
                      color={colors.neutral300}
                      weight="light"
                    />
                    <Typo size={14} color={colors.neutral400}>
                      Send a message to start chatting
                    </Typo>
                  </View>
                }
              />
            )}
          </View>

          {/* ── Input Bar ── */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.neutral400}
              value={messageText}
              onChangeText={handleTextChange}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!messageText.trim() || isSending}
              activeOpacity={0.8}
            >
              <Icons.PaperPlaneRight
                size={verticalScale(20)}
                color={messageText.trim() ? colors.black : colors.neutral400}
                weight="bold"
              />
            </TouchableOpacity>
          </View>

        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default ConversationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._15,
    paddingBottom: spacingY._10,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.neutral50,
    borderTopLeftRadius: verticalScale(20),
    borderTopRightRadius: verticalScale(20),
  },
  messageList: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
  },
  typingIndicator: {
    paddingHorizontal: spacingX._15,
    paddingBottom: spacingY._7,
  },
  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: verticalScale(80),
    gap: spacingY._10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.white,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
    gap: spacingX._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: radius._20,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
    fontSize: verticalScale(15),
    color: colors.text,
    maxHeight: verticalScale(120),
  },
  sendButton: {
    width: verticalScale(44),
    height: verticalScale(44),
    borderRadius: verticalScale(22),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral200,
  },
});
