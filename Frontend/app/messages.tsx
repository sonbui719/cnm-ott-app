import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ConversationItem from "../src/components/messages/ConversationItem";
import MessageTabs from "../src/components/messages/MessageTabs";
import { conversations, MessageTab } from "../src/data/messageData";
import { getAuthSession } from "../src/store/authStore";

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number>(2);
  const [currentUser, setCurrentUser] = useState(() => getAuthSession()?.user ?? null);

  useFocusEffect(
    useCallback(() => {
      setCurrentUser(getAuthSession()?.user ?? null);
    }, [])
  );

  const selectedConversation = useMemo(() => {
    return conversations.find((item) => item.id === selectedId) || null;
  }, [selectedId]);

  const filteredData = useMemo(() => {
    const lower = keyword.trim().toLowerCase();

    return conversations.filter((item) => {
      const matchTab = activeTab === "all" ? true : item.type === activeTab;

      const matchKeyword =
        !lower ||
        item.name.toLowerCase().includes(lower) ||
        item.preview.toLowerCase().includes(lower);

      return matchTab && matchKeyword;
    });
  }, [activeTab, keyword]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#5da2ff"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitle}>FinChat</Text>
              <Text style={styles.brandSub}>Tin nhắn cho điện thoại</Text>
            </View>
          </View>

          <Pressable style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Ionicons name="person-circle-outline" size={22} color="#ffffff" />
          </Pressable>
        </View>

        <Pressable style={styles.profileCard} onPress={() => router.push("/settings")}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {currentUser?.fullName?.[0] || "U"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {currentUser?.fullName || "Chưa đăng nhập"}
            </Text>
            <Text style={styles.userSub}>
              {currentUser?.phone || currentUser?.email || "---"}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#8f96a3" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm cuộc trò chuyện..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
          />
        </View>

        <MessageTabs activeTab={activeTab} onChange={setActiveTab} />

        {selectedConversation ? (
          <View style={styles.highlightCard}>
            <View style={styles.highlightTop}>
              <Text style={styles.highlightTitle} numberOfLines={1}>
                {selectedConversation.name}
              </Text>
              {!!selectedConversation.time && (
                <Text style={styles.highlightTime}>{selectedConversation.time}</Text>
              )}
            </View>

            <Text style={styles.highlightPreview} numberOfLines={3}>
              {selectedConversation.preview}
            </Text>

            <View style={styles.highlightFooter}>
              <View style={styles.typeChip}>
                <Ionicons
                  name={
                    selectedConversation.type === "group"
                      ? "people-outline"
                      : "chatbubble-outline"
                  }
                  size={14}
                  color="#dbeafe"
                />
                <Text style={styles.typeChipText}>
                  {selectedConversation.type === "group" ? "Nhóm" : "Cá nhân"}
                </Text>
              </View>

              <Pressable style={styles.openButton}>
                <Text style={styles.openButtonText}>Mở chat</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={styles.sectionTitle}>Danh sách trò chuyện</Text>

          {filteredData.map((item) => (
            <ConversationItem
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onPress={() => setSelectedId(item.id)}
            />
          ))}

          {filteredData.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color="#6b7280"
              />
              <Text style={styles.emptyText}>Không có cuộc trò chuyện phù hợp</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={[styles.bottomItem, styles.bottomItemActive]}>
            <Ionicons name="chatbubble-outline" size={18} color="#ffffff" />
            <Text style={[styles.bottomText, styles.bottomTextActive]}>Tin nhắn</Text>
          </Pressable>

          <Pressable style={styles.bottomItem} onPress={() => router.push("/settings")}>
            <Ionicons name="person-outline" size={18} color="#9ca3af" />
            <Text style={styles.bottomText}>Hồ sơ</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050505",
  },
  container: {
    flex: 1,
    backgroundColor: "#050505",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  brandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#0f2140",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  brandSub: {
    color: "#8f96a3",
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#141517",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3f3a27",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6b3d17",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  userName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  userSub: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
  searchBox: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5b5134",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 15,
  },
  highlightCard: {
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  highlightTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  highlightTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 12,
  },
  highlightTime: {
    color: "#9ca3af",
    fontSize: 12,
  },
  highlightPreview: {
    color: "#c9ced6",
    fontSize: 14,
    lineHeight: 20,
  },
  highlightFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15263f",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  typeChipText: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  openButton: {
    minWidth: 84,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  openButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 2,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#8f96a3",
    fontSize: 15,
    marginTop: 10,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  bottomItem: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomItemActive: {
    backgroundColor: "#1a1c20",
  },
  bottomText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  bottomTextActive: {
    color: "#ffffff",
  },
});