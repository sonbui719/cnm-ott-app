<<<<<<< HEAD
import { Link } from 'expo-router';

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity
=======
import { Link, router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable, SafeAreaView, ScrollView, StyleSheet,
  Text, View, ActivityIndicator, TouchableOpacity, Image
>>>>>>> main
} from "react-native";
import ConversationItem from "../src/components/messages/ConversationItem";
import MessageTabs from "../src/components/messages/MessageTabs";
import SearchUserModal from "../src/components/messages/SearchUserModal";
<<<<<<< HEAD
import { getAuthSession } from "../src/store/authStore";
import { initiateSocket, disconnectSocket } from "../src/services/socket";
import { API_BASE_URL } from "../src/config/api";
import { MessageTab, Conversation } from "../src/data/messageData"; // Chỉ import Type, không import mock data
=======
import CreateGroupModal from "../src/components/messages/CreateGroupModal";
import { getAuthSession } from "../src/store/authStore";
import { initiateSocket, disconnectSocket } from "../src/services/socket";
import { API_BASE_URL } from "../src/config/api";
import { MessageTab, Conversation } from "../src/data/messageData";
>>>>>>> main

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
<<<<<<< HEAD
  const [currentUser, setCurrentUser] = useState(() => getAuthSession()?.user ?? null);

  // State lưu danh sách chat thật từ Server
  const [realChats, setRealChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // Tải lại danh sách chat mỗi khi người dùng vào lại màn hình này
=======
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getAuthSession()?.user ?? null);
  const [realChats, setRealChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

>>>>>>> main
  useFocusEffect(
    useCallback(() => {
      const session = getAuthSession();
      setCurrentUser(session?.user ?? null);
      if (session?.token) {
        fetchChats(session.token);
<<<<<<< HEAD
=======
      } else {
        setLoadingChats(false);
        router.replace("/login");
>>>>>>> main
      }
    }, [])
  );

<<<<<<< HEAD
  // Kết nối socket khi vào màn hình tin nhắn
  useEffect(() => {
    if (currentUser?.id) {
      initiateSocket(currentUser.id);
    }
    return () => disconnectSocket();
  }, [currentUser]);

  // Hàm gọi API lấy danh sách chat
  const fetchChats = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRealChats(data);
    } catch (error) {
      console.error("Lỗi tải danh sách chat:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Chuẩn hóa dữ liệu từ Server thành định dạng Conversation của app
  const formattedChats: Conversation[] = useMemo(() => {
    return realChats.map((chat) => {
      // Tìm người nhận (người kia) trong phòng chat
      const receiver = chat.participants.find((p: any) => p._id !== currentUser?.id);

      const timeString = new Date(chat.updatedAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit'
      });

      return {
        id: chat._id,
        name: receiver?.fullName || "Người dùng ẩn",
        preview: chat.lastMessage || "Bắt đầu cuộc trò chuyện...",
        time: timeString,
        type: "personal", // Các cuộc chat hiện tại đều là 1-1 (cá nhân)
        avatarText: receiver?.fullName?.[0]?.toUpperCase() || "U",
=======
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRealChats(await res.json());
    } catch (error) { console.error("Lỗi tải chat:", error); }
    finally { setLoadingChats(false); }
  };

  const deleteConversation = async (conversationId: string) => {
    const session = getAuthSession();
    if (!session?.token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/chat/${conversationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRealChats((prev) => prev.filter((chat) => chat._id !== conversationId));
    } catch (error) {
      console.error("Loi xoa cuoc tro chuyen:", error);
      Alert.alert("Loi", "Khong the xoa cuoc tro chuyen");
    }
  };

  const confirmDeleteConversation = (conversation: Conversation) => {
    const message = `Ban co chac chan muon xoa cuoc tro chuyen voi ${conversation.name}?`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteConversation(String(conversation.id));
      }
      return;
    }

    Alert.alert("Xoa cuoc tro chuyen", message, [
      { text: "Huy", style: "cancel" },
      {
        text: "Xoa",
        style: "destructive",
        onPress: () => deleteConversation(String(conversation.id)),
      },
    ]);
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
>>>>>>> main
      };
    });
  }, [realChats, currentUser]);

<<<<<<< HEAD
  // Lọc danh sách theo Tab đang chọn (Tất cả / Cá nhân / Nhóm)
  const filteredChats = useMemo(() => {
    return formattedChats.filter((item) => {
      return activeTab === "all" ? true : item.type === activeTab;
    });
  }, [formattedChats, activeTab]);

  // Lấy cuộc trò chuyện mới nhất làm nổi bật ở trên cùng
  const featuredChat = formattedChats[0];

  return (

    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#5da2ff" />
            </View>
=======
  const filteredChats = useMemo(() => {
    return formattedChats.filter((item) => activeTab === "all" ? true : item.type === activeTab);
  }, [formattedChats, activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}><Ionicons name="chatbubble-ellipses-outline" size={20} color="#5da2ff" /></View>
>>>>>>> main
            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitle}>FinChat</Text>
              <Text style={styles.brandSub}>Tin nhắn cho điện thoại</Text>
            </View>
          </View>
<<<<<<< HEAD
          <Pressable style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Ionicons name="person-circle-outline" size={22} color="#ffffff" />
          </Pressable>
        </View>

        {/* THÔNG TIN NGƯỜI DÙNG */}
        <Pressable style={styles.profileCard} onPress={() => router.push("/settings")}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{currentUser?.fullName?.[0] || "U"}</Text>
=======
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
>>>>>>> main
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{currentUser?.fullName || "Chưa đăng nhập"}</Text>
            <Text style={styles.userSub}>{currentUser?.phone || currentUser?.email || "---"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

<<<<<<< HEAD
        {/* NÚT TÌM KIẾM MỞ MODAL */}
=======
>>>>>>> main
        <Pressable style={styles.searchBox} onPress={() => setIsSearchModalVisible(true)}>
          <Ionicons name="search-outline" size={18} color="#8f96a3" />
          <Text style={styles.searchPlaceholder}>Tìm bạn bè mới hoặc SĐT...</Text>
        </Pressable>
<<<<<<< HEAD
        <Link href="/ai-chat" asChild>
          <TouchableOpacity style={{ backgroundColor: '#1e293b', padding: 15, borderRadius: 10, marginHorizontal: 15, marginBottom: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
=======

        <Link href="/ai-chat" asChild>
          <TouchableOpacity style={{ backgroundColor: '#1e293b', padding: 15, borderRadius: 10, marginBottom: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
>>>>>>> main
            <Text style={{ fontSize: 20, marginRight: 10 }}>🤖</Text>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Trợ lý AI</Text>
          </TouchableOpacity>
        </Link>

<<<<<<< HEAD
        {/* TABS TẤT CẢ / CÁ NHÂN / NHÓM */}
        <MessageTabs activeTab={activeTab} onChange={setActiveTab} />

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>

          {/* CUỘC TRÒ CHUYỆN NỔI BẬT */}
          {featuredChat && (
            <View style={styles.highlightCard}>
              <View style={styles.highlightTop}>
                <Text style={styles.highlightTitle} numberOfLines={1}>{featuredChat.name}</Text>
                <Text style={styles.highlightTime}>{featuredChat.time}</Text>
              </View>
              <Text style={styles.highlightPreview} numberOfLines={3}>{featuredChat.preview}</Text>
              <View style={styles.highlightFooter}>
                <View style={styles.typeChip}>
                  <Ionicons name="chatbubble-outline" size={14} color="#dbeafe" />
                  <Text style={styles.typeChipText}>Cá nhân</Text>
                </View>
                <Pressable
                  style={styles.openButton}
                  onPress={() => router.push({ pathname: "/chat/[id]", params: { id: featuredChat.id, name: featuredChat.name } })}
                >
                  <Text style={styles.openButtonText}>Mở chat</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Danh sách trò chuyện</Text>

          {/* DANH SÁCH CÁC CUỘC TRÒ CHUYỆN */}
=======
        <MessageTabs activeTab={activeTab} onChange={setActiveTab} />

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          <Text style={styles.sectionTitle}>Danh sách trò chuyện</Text>

>>>>>>> main
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
<<<<<<< HEAD
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id, name: item.name } })}
=======
                onDelete={() => confirmDeleteConversation(item)}
                onPress={() => router.push({
                  pathname: "/chat/[id]",
                  params: { id: item.id, name: item.name, isGroup: item.type === "group" ? "true" : "false", avatar: item.avatarUrl || "" }
                })}
>>>>>>> main
              />
            ))
          )}
        </ScrollView>

<<<<<<< HEAD
        {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG (BOTTOM NAV) */}
        <View style={styles.bottomBar}>
          <Pressable style={[styles.bottomItem, styles.bottomItemActive]}>
            <Ionicons name="chatbubble-outline" size={18} color="#ffffff" />
            <Text style={[styles.bottomText, styles.bottomTextActive]}>Tin nhắn</Text>
          </Pressable>
          <Pressable style={styles.bottomItem} onPress={() => router.push("/tasks")}>
            <Ionicons name="list-outline" size={18} color="#9ca3af" />
            <Text style={styles.bottomText}>Công việc</Text>
          </Pressable>
          <Pressable style={styles.bottomItem} onPress={() => router.push("/settings")}>
            <Ionicons name="person-outline" size={18} color="#9ca3af" />
            <Text style={styles.bottomText}>Hồ sơ</Text>
          </Pressable>
        </View>

        {/* MODAL TÌM BẠN BÈ */}
        <SearchUserModal visible={isSearchModalVisible} onClose={() => setIsSearchModalVisible(false)} />
=======
        <SearchUserModal visible={isSearchModalVisible} onClose={() => setIsSearchModalVisible(false)} />
        <CreateGroupModal visible={isGroupModalVisible} onClose={() => setIsGroupModalVisible(false)} onSuccess={() => { const s = getAuthSession(); if (s?.token) fetchChats(s.token); }} />
>>>>>>> main
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
<<<<<<< HEAD
  highlightCard: { backgroundColor: "#111214", borderWidth: 1, borderColor: "#3f3a27", borderRadius: 16, padding: 14, marginBottom: 14 },
  highlightTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  highlightTitle: { flex: 1, color: "#ffffff", fontSize: 17, fontWeight: "700", marginRight: 12 },
  highlightTime: { color: "#9ca3af", fontSize: 12 },
  highlightPreview: { color: "#c9ced6", fontSize: 14, lineHeight: 20 },
  highlightFooter: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#15263f", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  typeChipText: { color: "#dbeafe", fontSize: 12, fontWeight: "600", marginLeft: 6 },
  openButton: { minWidth: 84, height: 34, borderRadius: 10, backgroundColor: "#1e5eff", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  openButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
=======
>>>>>>> main
  list: { flex: 1 },
  listContent: { paddingBottom: 100 },
  sectionTitle: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginBottom: 8, marginTop: 2 },
  emptyBox: { paddingVertical: 40, alignItems: "center" },
<<<<<<< HEAD
  emptyText: { color: "#8f96a3", fontSize: 15, marginTop: 10 },
  bottomBar: { position: "absolute", left: 16, right: 16, bottom: 16, height: 62, borderRadius: 18, backgroundColor: "#111214", borderWidth: 1, borderColor: "#3f3a27", flexDirection: "row", alignItems: "center", paddingHorizontal: 10 },
  bottomItem: { flex: 1, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bottomItemActive: { backgroundColor: "#1a1c20" },
  bottomText: { color: "#9ca3af", fontSize: 12, fontWeight: "600", marginTop: 4 },
  bottomTextActive: { color: "#ffffff" }
});
=======
  emptyText: { color: "#8f96a3", fontSize: 15, marginTop: 10 }
});

>>>>>>> main
