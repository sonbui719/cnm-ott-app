import { Link, router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Pressable, SafeAreaView, ScrollView, StyleSheet,
  Text, View, ActivityIndicator, TouchableOpacity, Image
} from "react-native";
import ConversationItem from "../src/components/messages/ConversationItem";
import MessageTabs from "../src/components/messages/MessageTabs";
import SearchUserModal from "../src/components/messages/SearchUserModal";
import CreateGroupModal from "../src/components/messages/CreateGroupModal";
import { getAuthSession } from "../src/store/authStore";
import { initiateSocket, disconnectSocket } from "../src/services/socket";
import { API_BASE_URL } from "../src/config/api";
import { MessageTab, Conversation } from "../src/data/messageData";

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getAuthSession()?.user ?? null);
  const [realChats, setRealChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const session = getAuthSession();
      setCurrentUser(session?.user ?? null);
      if (session?.token) fetchChats(session.token);
    }, [])
  );

  useEffect(() => {
    if (!currentUser?.id) return;

    const activeSocket = initiateSocket(currentUser.id);
    const refreshChats = () => {
      const session = getAuthSession();
      if (session?.token) fetchChats(session.token);
    };

    activeSocket.on("receive_message", refreshChats);
    activeSocket.on("message_unsent_receive", refreshChats);

    return () => {
      activeSocket.off("receive_message", refreshChats);
      activeSocket.off("message_unsent_receive", refreshChats);
      disconnectSocket();
    };
  }, [currentUser]);

  const fetchChats = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, { headers: { 'Authorization': `Bearer ${token}` } });
      setRealChats(await res.json());
    } catch (error) { console.error("Lỗi tải chat:", error); } 
    finally { setLoadingChats(false); }
  };

  const formattedChats: Conversation[] = useMemo(() => {
    return realChats.map((chat) => {
      const receiver = chat.participants.find((p: any) => p._id !== currentUser?.id);
      const timeString = new Date(chat.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      return {
        id: chat._id,
        name: chat.isGroupChat ? chat.chatName : (receiver?.fullName || "Người dùng ẩn"),
        preview: chat.lastMessage || "Bắt đầu cuộc trò chuyện...",
        time: timeString,
        type: chat.isGroupChat ? "group" : "personal",
        avatarText: chat.isGroupChat ? chat.chatName?.[0]?.toUpperCase() : (receiver?.fullName?.[0]?.toUpperCase() || "U"),
        avatarUrl: chat.isGroupChat ? chat.groupAvatar : receiver?.avatar,
      };
    });
  }, [realChats, currentUser]);

  const filteredChats = useMemo(() => {
    return formattedChats.filter((item) => activeTab === "all" ? true : item.type === activeTab);
  }, [formattedChats, activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}><Ionicons name="chatbubble-ellipses-outline" size={20} color="#5da2ff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitle}>FinChat</Text>
              <Text style={styles.brandSub}>Tin nhắn cho điện thoại</Text>
            </View>
          </View>
          <Pressable style={styles.iconButton} onPress={() => setIsGroupModalVisible(true)}>
            <Ionicons name="people-circle-outline" size={24} color="#22c55e" />
          </Pressable>
        </View>

        <Pressable style={styles.profileCard} onPress={() => router.push("/settings")}>
          <View style={styles.userAvatar}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={{ width: 42, height: 42, borderRadius: 21 }} />
            ) : (
              <Text style={styles.userAvatarText}>{currentUser?.fullName?.[0] || "U"}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{currentUser?.fullName || "Chưa đăng nhập"}</Text>
            <Text style={styles.userSub}>{currentUser?.phone || currentUser?.email || "---"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <Pressable style={styles.searchBox} onPress={() => setIsSearchModalVisible(true)}>
          <Ionicons name="search-outline" size={18} color="#8f96a3" />
          <Text style={styles.searchPlaceholder}>Tìm bạn bè mới hoặc SĐT...</Text>
        </Pressable>

        <MessageTabs activeTab={activeTab} onChange={setActiveTab} />

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <Text style={styles.sectionTitle}>Danh sách trò chuyện</Text>

          {loadingChats ? (
            <ActivityIndicator size="large" color="#1e5eff" style={{ marginTop: 20 }} />
          ) : filteredChats.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#6b7280" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
            </View>
          ) : (
            filteredChats.map((item) => (
              <ConversationItem
                key={item.id}
                item={item}
                onPress={() => router.push({ 
                  pathname: "/chat/[id]", 
                  params: { id: item.id, name: item.name, isGroup: item.type === "group" ? "true" : "false", avatar: item.avatarUrl || "" } 
                })}
              />
            ))
          )}
        </ScrollView>

        <SearchUserModal visible={isSearchModalVisible} onClose={() => setIsSearchModalVisible(false)} />
        <CreateGroupModal visible={isGroupModalVisible} onClose={() => setIsGroupModalVisible(false)} onSuccess={() => { const s = getAuthSession(); if(s?.token) fetchChats(s.token); }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1, backgroundColor: "#050505", paddingHorizontal: 16, paddingTop: 10 },
  topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  brandRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  logoCircle: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#0f2140", alignItems: "center", justifyContent: "center", marginRight: 10 },
  brandTitle: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
  brandSub: { color: "#8f96a3", fontSize: 12, marginTop: 2 },
  iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#141517", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#3f3a27" },
  profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#111214", borderWidth: 1, borderColor: "#3f3a27", borderRadius: 16, padding: 14, marginBottom: 14 },
  userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#6b3d17", alignItems: "center", justifyContent: "center", marginRight: 12 },
  userAvatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  userName: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  userSub: { color: "#9ca3af", fontSize: 13, marginTop: 2 },
  searchBox: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: "#5b5134", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchPlaceholder: { flex: 1, color: "#6b7280", marginLeft: 8, fontSize: 15 },
  list: { flex: 1 },
  listContent: { paddingBottom: 100 },
  sectionTitle: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginBottom: 8, marginTop: 2 },
  emptyBox: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#8f96a3", fontSize: 15, marginTop: 10 }
});

