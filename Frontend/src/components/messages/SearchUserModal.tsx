import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_BASE_URL } from "../../config/api";
import { getAuthSession } from "../../store/authStore";

type SearchedUser = {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  avatar?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  existingChats?: any[];
  onChatStarted?: () => void;
};

export default function SearchUserModal({
  visible,
  onClose,
  existingChats = [],
  onChatStarted,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const openChat = (chatId: string, user: SearchedUser, avatar?: string) => {
    onClose();
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: chatId,
        name: user.fullName,
        isGroup: "false",
        avatar: avatar || user.avatar || "",
      },
    });
  };

  const findExistingDirectChat = (userId: string) => {
    const session = getAuthSession();
    const currentUserId = String(session?.user?.id || session?.user?._id || "");

    return existingChats.find((chat) => {
      if (chat?.isGroupChat) return false;
      const participants = Array.isArray(chat?.participants) ? chat.participants : [];
      const ids = participants.map((participant: any) =>
        String(participant?._id || participant?.id || participant || "")
      );
      return ids.includes(currentUserId) && ids.includes(String(userId));
    });
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const session = getAuthSession();
      const response = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(keyword.trim())}`,
        { headers: { Authorization: `Bearer ${session?.token}` } }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (user: SearchedUser) => {
    try {
      const existingChat = findExistingDirectChat(user._id);
      if (existingChat?._id) {
        const other = (existingChat.participants || []).find((participant: any) =>
          String(participant?._id || participant?.id || participant || "") === String(user._id)
        );
        openChat(existingChat._id, user, other?.avatar);
        return;
      }

      const session = getAuthSession();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const chatRoom = await response.json();

      onChatStarted?.();
      openChat(
        chatRoom._id,
        user,
        chatRoom?.participants?.find(
          (participant: any) => String(participant?._id || participant?.id || "") === String(user._id)
        )?.avatar
      );
    } catch (error) {
      console.error("Lỗi khởi tạo phòng chat:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Tìm bạn bè mới</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.inputBox}>
              <Ionicons name="search" size={20} color="#8f96a3" />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên hoặc số điện thoại..."
                placeholderTextColor="#6b7280"
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSearch}
                autoFocus
              />
            </View>
            <Pressable style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Tìm</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1e5eff" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingVertical: 10 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {keyword ? "Không tìm thấy ai phù hợp" : "Gõ để bắt đầu tìm kiếm"}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.fullName[0]?.toUpperCase() || "U"}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.userPhone}>{item.phone}</Text>
                  </View>
                  <Pressable style={styles.chatBtn} onPress={() => handleStartChat(item)}>
                    <Ionicons name="chatbubble" size={16} color="#fff" />
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </Pressable>
                </View>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#111214", height: "85%", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: "#222" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
  closeBtn: { padding: 5, backgroundColor: "#1a1c20", borderRadius: 20 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 15 },
  inputBox: { flex: 1, flexDirection: "row", backgroundColor: "#1a1c20", borderRadius: 12, paddingHorizontal: 12, height: 48, alignItems: "center", borderWidth: 1, borderColor: "#333" },
  input: { flex: 1, color: "#fff", marginLeft: 8, fontSize: 15 },
  searchBtn: { backgroundColor: "#1e5eff", height: 48, paddingHorizontal: 20, borderRadius: 12, justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  emptyText: { color: "#8f96a3", textAlign: "center", marginTop: 40, fontSize: 15 },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#16181b", padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#2a2d33" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#153566", alignItems: "center", justifyContent: "center", marginRight: 14 },
  avatarText: { color: "#9fc2ff", fontSize: 18, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  userPhone: { color: "#9ca3af", fontSize: 13, marginTop: 4 },
  chatBtn: { flexDirection: "row", backgroundColor: "#1e5eff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: "center", gap: 6 },
  chatBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
