import { ConversationListItemProps } from "@/types";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "./Avatar";
import Typo from "./Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { scale, verticalScale } from "@/utils/styling";

/**
 * ConversationListItem
 *
 * Implements ConversationListItemProps from types.ts:
 *   item        — ConversationProps (already typed in types.ts)
 *   showDivider — whether to render a hairline below
 *   isGroup     — reserved for future group support
 *   router      — passed from home.tsx's useRouter()
 *
 * For direct conversations: resolves the "other" participant using
 * the current user id from useAuth() context (already stable).
 *
 * Navigation: pushes to /(main)/conversation/[id] with name + avatar
 * as params so the chat screen header renders without an extra API call.
 */
const ConversationListItem = ({
  item,
  showDivider,
  isGroup = false,
  router,
}: ConversationListItemProps) => {
  const { user } = useAuth();

  // For direct 1:1, show the other participant's info
  const otherParticipant =
    item.type === "direct"
      ? item.participants.find((p) => p._id !== user?.id)
      : null;

  const displayName =
    item.type === "direct"
      ? otherParticipant?.name || "Unknown"
      : item.name || "Group";

  const displayAvatar =
    item.type === "direct"
      ? otherParticipant?.avatar || null
      : item.avatar || null;

  const lastMessageText = item.lastMessage
    ? item.lastMessage.type === "text"
      ? item.lastMessage.content
      : "📎 Attachment"
    : "Tap to start chatting";

  const lastMessageTime = item.lastMessage
    ? formatTime(item.lastMessage.createdAt)
    : "";

  const handlePress = () => {
    router.push({
      pathname: "/(main)/conversation/[id]",
      params: {
        id: item._id,
        name: displayName,
        avatar: displayAvatar || "",
      },
    });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Avatar uri={displayAvatar} size={52} />
        <View style={styles.content}>
          <View style={styles.row}>
            <Typo size={15} fontWeight="600" color={colors.neutral800}>
              {displayName}
            </Typo>
            {lastMessageTime ? (
              <Typo size={12} color={colors.neutral400}>
                {lastMessageTime}
              </Typo>
            ) : null}
          </View>
          <Typo
            size={13}
            color={colors.neutral500}
            style={{ marginTop: 2 }}
            textProps={{ numberOfLines: 1 }}
          >
            {lastMessageText}
          </Typo>
        </View>
      </TouchableOpacity>

      {showDivider && <View style={styles.divider} />}
    </>
  );
};

/**
 * Formats a date string to a human-readable time label:
 *   Same day → "14:30"
 *   Yesterday → "Yesterday"
 *   This week → "Mon"
 *   Older → "12 Jan"
 */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  }
}

export default ConversationListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Divider indented to align with text (avatar width + gap)
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: spacingX._20 + scale(52) + spacingX._12,
  },
});
