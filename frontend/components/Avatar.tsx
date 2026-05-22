import { AvatarProps } from "@/types";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "@/constants/theme";
import * as Icons from "phosphor-react-native";
import { scale } from "@/utils/styling";

/**
 * Avatar — reusable circular user/group avatar.
 *
 * Props match the AvatarProps type already defined in types.ts.
 * Uses React Native Image (not expo-image) to match the pattern of
 * existing screens that use Animated.Image from react-native.
 *
 * If uri is null/empty → shows a phosphor User icon placeholder
 * consistent with the existing icon library (phosphor-react-native).
 */
const Avatar = ({ size = 50, uri, style, isGroup = false }: AvatarProps) => {
  const diameter = scale(size);

  return (
    <View
      style={[
        styles.container,
        { width: diameter, height: diameter, borderRadius: diameter / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: diameter / 2 }]}
          resizeMode="cover"
        />
      ) : (
        <Icons.User
          size={scale(size * 0.55)}
          color={colors.neutral500}
          weight="bold"
        />
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
