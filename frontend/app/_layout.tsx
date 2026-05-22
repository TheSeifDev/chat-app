import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/authContext";
import { ConversationProvider } from "@/contexts/conversationContext";

const StackLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};
const RootLayout = () => {
  return (
    <AuthProvider>
      <ConversationProvider>
        <StackLayout />
      </ConversationProvider>
    </AuthProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
