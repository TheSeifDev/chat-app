import { Button, StyleSheet } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";

const Home = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Home</Typo>

      <Button title="Logout" onPress={handleLogout} />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
