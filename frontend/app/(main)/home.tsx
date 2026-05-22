import { Button, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { testSocket } from "@/socket/socketEvents";
import { verticalScale } from "react-native-size-matters";

const Home = () => {
  const { user, signOut } = useAuth();

  // useEffect(() => {
  //   testSocket(testSocketCallbackHandler);
  //   testSocket(null);

  //   return () => {
  //     testSocket(testSocketCallbackHandler, true);
  //   };
  // }, []);

  // const testSocketCallbackHandler = (data: any) => {
  //   console.log("Received test socket event from server", data);
  // };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({

  // conversationList:{
    
  // }

  // settingIcon:{
  //   padding:spacingY._10,
  //   backgroundColor:colors.neutral700,
  //   borderRaduis:raduis.full,
  // },

  // floatingButton:{
  //   height: verticalScale(50),
  //   width: verticalScale(50),
  //   borderRadius: 100,
  //   position: "absolute",
  //   bottom: verticalScale(30),
  //   right: verticalScale(30),
  // }
});
