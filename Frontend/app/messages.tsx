import React, { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MessageTabs from "../src/components/messages/MessageTabs";
import ConversationItem from "../src/components/messages/ConversationItem";
import { conversations, MessageTab } from "../src/data/messageData";

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number>(2);

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
        <View style={styles.sidebar}>
          <View style={styles.brandBox}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color="#5da2ff"
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>StartupChat</Text>
              <Text style={styles.brandSub}>OTT cho Startup</Text>
            </View>
          </View>

          <View style={styles.menuList}>
            <Pressable style={[styles.menuItem, styles.menuItemActive]}>
              <Ionicons name="chatbubble-outline" size={20} color="#dbeafe" />
              <Text style={[styles.menuText, styles.menuTextActive]}>
                Tin nhắn
              </Text>
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>4</Text>
              </View>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="people-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Nhóm</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="checkbox-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Công việc</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="sparkles-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Trợ lý AI</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="bar-chart-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Thống kê</Text>
            </Pressable>
          </View>

          <Pressable style={styles.userBox} onPress={() => router.push("/settings")}>
  <View style={styles.userAvatar}>
    <Text style={styles.userAvatarText}>P</Text>
  </View>

  <View>
    <Text style={styles.userName}>Phạm Quốc Khách</Text>
    <Text style={styles.userPhone}>0945678901</Text>
  </View>
</Pressable>
        </View>

        <View style={styles.main}>
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Tin nhắn</Text>

            <Pressable style={styles.newButton}>
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={styles.newButtonText}>Mới</Text>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#8f96a3" />
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              placeholderTextColor="#6b7280"
              style={styles.searchInput}
            />
          </View>

          <MessageTabs activeTab={activeTab} onChange={setActiveTab} />

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
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
                <Text style={styles.emptyText}>
                  Không có cuộc trò chuyện phù hợp
                </Text>
              </View>
            ) : null}
          </ScrollView>
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
    flexDirection: "row",
    backgroundColor: "#050505",
  },
  sidebar: {
    width: 235,
    borderRightWidth: 1,
    borderRightColor: "#3f3a27",
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    justifyContent: "space-between",
    backgroundColor: "#111214",
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#3f3a27",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#155eef",
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
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  menuList: {
    flex: 1,
    marginTop: 20,
  },
  menuItem: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: "#13233a",
  },
  menuText: {
    color: "#d1d5db",
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  menuTextActive: {
    color: "#ffffff",
  },
  menuBadge: {
    marginLeft: "auto",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  userBox: {
    borderTopWidth: 1,
    borderTopColor: "#3f3a27",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6b3d17",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  userName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  userPhone: {
    color: "#8f96a3",
    fontSize: 13,
    marginTop: 2,
  },
  main: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "700",
  },
  newButton: {
    height: 42,
    minWidth: 92,
    borderRadius: 10,
    backgroundColor: "#1e5eff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  newButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
  searchBox: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5b5134",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 15,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#8f96a3",
    fontSize: 15,
  },
});