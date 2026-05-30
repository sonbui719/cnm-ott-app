import { Link, router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Alert,
  Platform,
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

type CallHistoryItem = {
  _id: string;
  callId: string;
  conversation?: string | { _id?: string; chatName?: string; isGroupChat?: boolean };
  caller?: { _id?: string; id?: string; fullName?: string; avatar?: string };
  participants?: Array<{ _id?: string; id?: string; fullName?: string; avatar?: string }>;
  answeredBy?: any[];
  rejectedBy?: any[];
  missedBy?: any[];
  unavailableBy?: any[];
  callType?: "audio" | "video";
  isGroupCall?: boolean;
  status?: "ringing" | "answered" | "ended" | "rejected" | "missed" | "unavailable" | "canceled";
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
};

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getAuthSession()?.user ?? null);
  const [realChats, setRealChats] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingCalls, setLoadingCalls] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const session = getAuthSession();
      setCurrentUser(session?.user ?? null);
      if (session?.token) {
        fetchChats(session.token);
        fetchCallHistory(session.token);
      } else {
        setLoadingChats(false);
        router.replace("/login");
      }
    }, [])
  );

  useEffect(() => {
    if (!currentUser?.id) return;

    const activeSocket = initiateSocket(currentUser.id);
    const refreshChats = () => {
      const session = getAuthSession();
      if (session?.token) fetchChats(session.token);
    };
    const refreshCalls = () => {
      const session = getAuthSession();
      if (session?.token) fetchCallHistory(session.token);
    };

    activeSocket.on("receive_message", refreshChats);
    activeSocket.on("message_unsent_receive", refreshChats);
    activeSocket.on("call_unavailable", refreshCalls);
    activeSocket.on("call_timeout", refreshCalls);
    activeSocket.on("call_missed", refreshCalls);
    activeSocket.on("call_accepted", refreshCalls);
    activeSocket.on("call_rejected", refreshCalls);

    return () => {
      activeSocket.off("receive_message", refreshChats);
      activeSocket.off("message_unsent_receive", refreshChats);
      activeSocket.off("call_unavailable", refreshCalls);
      activeSocket.off("call_timeout", refreshCalls);
      activeSocket.off("call_missed", refreshCalls);
      activeSocket.off("call_accepted", refreshCalls);
      activeSocket.off("call_rejected", refreshCalls);
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

  const fetchCallHistory = async (token: string) => {
    try {
      setLoadingCalls(true);
      const res = await fetch(`${API_BASE_URL}/chat/calls/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCallHistory(await res.json());
    } catch (error) {
      console.error("Lỗi tải lịch sử cuộc gọi:", error);
    } finally {
      setLoadingCalls(false);
    }
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
      console.error("Lỗi xóa cuộc trò chuyện:", error);
      Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện");
    }
  };

  const confirmDeleteConversation = (conversation: Conversation) => {
    const message = `Bạn có chắc chắn muốn xóa cuộc trò chuyện với ${conversation.name}?`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteConversation(String(conversation.id));
      }
      return;
    }

    Alert.alert("Xóa cuộc trò chuyện", message, [
      { text: "Huy", style: "cancel" },
      {
        text: "Xóa",
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
      };
    });
  }, [realChats, currentUser]);

  const filteredChats = useMemo(() => {
    if (activeTab === "calls") return [];
    return formattedChats.filter((item) => activeTab === "all" ? true : item.type === activeTab);
  }, [formattedChats, activeTab]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0 giây";
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (!minutes) return `${rest} giây`;
    return `${minutes} phút ${rest.toString().padStart(2, "0")} giây`;
  };

  const getCallMeta = (item: CallHistoryItem) => {
    const callerId = String(item.caller?._id || item.caller?.id || "");
    const isOutgoing = callerId === String(currentUser?.id || "");
    const otherParticipants = (item.participants || []).filter(
      (participant) => String(participant._id || participant.id || "") !== String(currentUser?.id || "")
    );
    const fallbackName = item.isGroupCall ? "Cuộc gọi nhóm" : "Người dùng";
    const name = item.isGroupCall
      ? (typeof item.conversation === "object" && item.conversation?.chatName) || "Cuộc gọi nhóm"
      : otherParticipants[0]?.fullName || item.caller?.fullName || fallbackName;
    const avatarUrl = item.isGroupCall ? undefined : otherParticipants[0]?.avatar || item.caller?.avatar;
    const avatarText = (name || fallbackName).trim()[0]?.toUpperCase() || "C";
    const time = item.startedAt
      ? new Date(item.startedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "";
    const callTypeText = item.callType === "video" ? "Video" : "Thoại";
    const directionText = isOutgoing ? "Bạn đã gọi" : `${item.caller?.fullName || "Ai đó"} đã gọi`;

    const statusText =
      item.status === "answered" || item.status === "ended"
        ? `Đã nghe - ${formatDuration(item.durationSeconds)}`
        : item.status === "missed"
          ? isOutgoing
            ? "Không có phản hồi"
            : "Cuộc gọi nhỡ"
          : item.status === "unavailable"
            ? "Người nhận không hoạt động"
            : item.status === "rejected"
              ? "Đã từ chối"
              : "Đang gọi";

    return {
      name,
      avatarText,
      avatarUrl,
      time,
      preview: `${callTypeText} - ${directionText} - ${statusText}`,
      isOutgoing,
    };
  };

  const renderCallHistoryItem = (item: CallHistoryItem) => {
    const meta = getCallMeta(item);
    const conversationId = typeof item.conversation === "object" ? item.conversation?._id : item.conversation;

    return (
      <Pressable
        key={item._id}
        style={styles.callItem}
        onPress={() => {
          if (!conversationId) return;
          router.push({
            pathname: "/chat/[id]",
            params: {
              id: conversationId,
              name: meta.name,
              isGroup: item.isGroupCall ? "true" : "false",
              avatar: meta.avatarUrl || "",
            },
          });
        }}
      >
        <View style={styles.callAvatar}>
          {meta.avatarUrl ? (
            <Image source={{ uri: meta.avatarUrl }} style={styles.callAvatarImage} />
          ) : (
            <Text style={styles.callAvatarText}>{meta.avatarText}</Text>
          )}
        </View>
        <View style={styles.callContent}>
          <View style={styles.callHeaderRow}>
            <Text style={styles.callName} numberOfLines={1}>{meta.name}</Text>
            <Text style={styles.callTime}>{meta.time}</Text>
          </View>
          <View style={styles.callPreviewRow}>
            <Ionicons
              name={item.callType === "video" ? "videocam-outline" : "call-outline"}
              size={15}
              color={item.status === "missed" || item.status === "unavailable" ? "#ef4444" : "#22c55e"}
            />
            <Text
              style={[
                styles.callPreview,
                (item.status === "missed" || item.status === "unavailable") && styles.callPreviewWarning,
              ]}
              numberOfLines={1}
            >
              {meta.preview}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

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
          {activeTab === "calls" ? (
            <>
              <Text style={styles.sectionTitle}>Lịch sử cuộc gọi</Text>

              {loadingCalls ? (
                <ActivityIndicator size="large" color="#1e5eff" style={{ marginTop: 20 }} />
              ) : callHistory.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="call-outline" size={28} color="#6b7280" />
                  <Text style={styles.emptyText}>Chưa có lịch sử cuộc gọi</Text>
                </View>
              ) : (
                callHistory.map(renderCallHistoryItem)
              )}
            </>
          ) : (
            <>
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
                onDelete={() => confirmDeleteConversation(item)}
                onPress={() => router.push({ 
                  pathname: "/chat/[id]", 
                  params: { id: item.id, name: item.name, isGroup: item.type === "group" ? "true" : "false", avatar: item.avatarUrl || "" } 
                })}
              />
            ))
          )}
            </>
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
  emptyText: { color: "#8f96a3", fontSize: 15, marginTop: 10 },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  callAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10233f",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  callAvatarImage: { width: 48, height: 48, borderRadius: 24 },
  callAvatarText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  callContent: { flex: 1 },
  callHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  callName: { color: "#ffffff", fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
  callTime: { color: "#9ca3af", fontSize: 12 },
  callPreviewRow: { flexDirection: "row", alignItems: "center" },
  callPreview: { color: "#9ca3af", fontSize: 14, marginLeft: 7, flex: 1 },
  callPreviewWarning: { color: "#fca5a5" },
});

