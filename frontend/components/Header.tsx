import { HeaderProps } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "./Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";

/**
 * Header — reusable screen header bar.
 *
 * Props match the HeaderProps type already defined in types.ts:
 *   title?     — center text
 *   leftIcon?  — left slot (e.g. BackButton)
 *   rightIcon? — right slot (e.g. settings icon)
 *   style?     — override container style
 *
 * Used by screens that need a structured header without
 * adding the native navigation header (headerShown: false in _layout.tsx).
 */
const Header = ({ title, style, leftIcon, rightIcon }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>{leftIcon}</View>
      {title ? (
        <Typo size={18} fontWeight="600" color={colors.white}>
          {title}
        </Typo>
      ) : (
        <View />
      )}
      <View style={styles.side}>{rightIcon}</View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._10,
  },
  side: {
    width: 40,
    alignItems: "center",
  },
});
