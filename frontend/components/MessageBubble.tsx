import { MessageProps } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

/**
 * MessageBubble
 *
 * Renders a single chat message bubble.
 * isMe flag controls alignment and bubble color:
 *   isMe=true  → right-aligned, colors.myBubble (#FFE1CC)
 *   isMe=false → left-aligned,  colors.otherBubble (#FFF1BF)
 *
 * Both bubble colors are defined in the existing theme.ts — not hardcoded.
 * The corner closest to the "tail" is flattened (borderBottomRightRadius /
 * borderBottomLeftRadius) for the typical chat bubble shape.
 *
 * Uses the MessageProps type from types.ts (message.id, sender, content, createdAt).
 */
type MessageBubbleProps = {
  message: MessageProps;
  isMe: boolean;
};

const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
  return (
    <View style={[styles.wrapper, isMe ? styles.myWrapper : styles.otherWrapper]}>
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Typo size={15} color={colors.neutral800}>
          {message.content}
        </Typo>
        <Typo
          size={11}
          color={colors.neutral500}
          style={styles.time}
        >
          {formatTime(message.createdAt)}
        </Typo>
      </View>
    </View>
  );
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default MessageBubble;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacingY._7,
  },
  myWrapper: {
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: radius._15,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
  },
  myBubble: {
    backgroundColor: colors.myBubble,
    borderBottomRightRadius: radius._3,
  },
  otherBubble: {
    backgroundColor: colors.otherBubble,
    borderBottomLeftRadius: radius._3,
  },
  time: {
    marginTop: spacingY._5,
    alignSelf: "flex-end",
  },
});
