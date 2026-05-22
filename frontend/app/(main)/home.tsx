import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { useConversations } from "@/contexts/conversationContext";
import ConversationListItem from "@/components/ConversationListItem";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import Loading from "@/components/Loading";

/**
 * Home — Main conversation list screen.
 *
 * Connects to:
 *   useAuth()          → user info, signOut (existing authContext)
 *   useConversations() → conversations list, fetchConversations (new context)
 *   useRouter()        → navigation to newConversation and conversation screens
 *
 * useFocusEffect refetches conversations whenever the screen comes
 * back into focus (e.g. after returning from chat screen), so the
 * list stays fresh without polling.
 *
 * The FAB + settingIcon + conversationList structure was already
 * hinted at in the commented-out StyleSheet below this component.
 */
const Home = () => {
  const { signOut } = useAuth();
  const { conversations, isLoading, fetchConversations } = useConversations();
  const router = useRouter();

  // Refetch conversation list every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Typo size={24} fontWeight="700" color={colors.white}>
            Messages
          </Typo>
          <TouchableOpacity
            style={styles.settingIcon}
            onPress={signOut}
            activeOpacity={0.7}
          >
            <Icons.SignOut
              size={verticalScale(22)}
              color={colors.white}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        {/* ── Conversation List ── */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <Loading />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id}
              renderItem={({ item, index }) => (
                <ConversationListItem
                  item={item}
                  showDivider={index < conversations.length - 1}
                  router={router}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icons.ChatCircleDots
                    size={verticalScale(64)}
                    color={colors.neutral300}
                    weight="light"
                  />
                  <Typo size={16} fontWeight="600" color={colors.neutral400}>
                    No conversations yet
                  </Typo>
                  <Typo size={13} color={colors.neutral400}>
                    Tap the pencil button to start chatting
                  </Typo>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                conversations.length === 0 ? styles.emptyListContent : undefined
              }
            />
          )}
        </View>

        {/* ── Floating Action Button ── */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push("/(main)/newConversation")}
          activeOpacity={0.85}
        >
          <Icons.Pencil
            size={verticalScale(22)}
            color={colors.black}
            weight="bold"
          />
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._15,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: 50,
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: verticalScale(30),
    borderTopRightRadius: verticalScale(30),
    overflow: "hidden",
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacingY._10,
    paddingTop: verticalScale(80),
  },
  floatingButton: {
    height: verticalScale(52),
    width: verticalScale(52),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: spacingX._20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
