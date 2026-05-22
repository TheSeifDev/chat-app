import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { searchUsers, UserSearchResult } from "@/services/user.Service";
import Avatar from "@/components/Avatar";
import { useConversations } from "@/contexts/conversationContext";
import { useRouter } from "expo-router";

/**
 * NewConversation — User search screen to start a new 1:1 chat.
 *
 * Connects to:
 *   searchUsers()         → GET /user/search?q=... via user.Service.ts
 *   useConversations()    → createConversation() which calls POST /conversation
 *   useRouter()           → navigate to conversation/[id] after creation
 *
 * Search triggers after 2+ characters (debounced via setState → API call on change).
 * Selecting a user → createConversation (idempotent: returns existing if found)
 *                  → router.replace to chat screen with name/avatar params.
 *
 * Uses router.replace (not push) so the back button from the chat screen
 * goes to Home, not back to this search screen.
 */
const NewConversation = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const { createConversation } = useConversations();
  const router = useRouter();

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setUsers([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(text.trim());
      setUsers(results);
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectUser = async (targetUser: UserSearchResult) => {
    if (isCreating) return;
    setIsCreating(targetUser._id);
    try {
      const conversation = await createConversation(targetUser._id);
      // Replace so back from chat goes to Home, not back here
      router.replace({
        pathname: "/(main)/conversation/[id]",
        params: {
          id: conversation._id,
          name: targetUser.name,
          avatar: targetUser.avatar || "",
        },
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      setIsCreating(null);
    }
  };

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <BackButton iconSize={26} />
          <Typo size={18} fontWeight="600" color={colors.white}>
            New Message
          </Typo>
          <View style={{ width: 30 }} />
        </View>

        {/* ── Content Card ── */}
        <View style={styles.content}>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Icons.MagnifyingGlass
              size={verticalScale(18)}
              color={colors.neutral400}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor={colors.neutral400}
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>

          {/* Results List */}
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => handleSelectUser(item)}
                activeOpacity={0.7}
                disabled={!!isCreating}
              >
                <Avatar uri={item.avatar || null} size={46} />
                <View style={styles.userInfo}>
                  <Typo size={15} fontWeight="600" color={colors.neutral800}>
                    {item.name}
                  </Typo>
                  <Typo size={13} color={colors.neutral500}>
                    {item.email}
                  </Typo>
                </View>
                {isCreating === item._id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Icons.ArrowRight
                    size={verticalScale(18)}
                    color={colors.neutral300}
                  />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !isSearching ? (
                <View style={styles.empty}>
                  {query.length < 2 ? (
                    <>
                      <Icons.MagnifyingGlass
                        size={verticalScale(48)}
                        color={colors.neutral300}
                        weight="light"
                      />
                      <Typo size={14} color={colors.neutral400}>
                        Type at least 2 characters to search
                      </Typo>
                    </>
                  ) : (
                    <>
                      <Icons.UserCircle
                        size={verticalScale(48)}
                        color={colors.neutral300}
                        weight="light"
                      />
                      <Typo size={14} color={colors.neutral400}>
                        No users found for "{query}"
                      </Typo>
                    </>
                  )}
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />

        </View>
      </View>
    </ScreenWrapper>
  );
};

export default NewConversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._15,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: verticalScale(30),
    borderTopRightRadius: verticalScale(30),
    paddingTop: spacingY._20,
    overflow: "hidden",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: radius.full,
    paddingHorizontal: spacingX._15,
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._15,
    height: verticalScale(48),
    gap: spacingX._10,
  },
  searchInput: {
    flex: 1,
    fontSize: verticalScale(15),
    color: colors.text,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  userInfo: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: verticalScale(60),
    gap: spacingY._10,
  },
});
