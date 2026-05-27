import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { API_BASE_URL } from "../../src/config/api";
import { getAuthSession } from "../../src/store/authStore";
import { getSocket } from "../../src/services/socket";
import { setActiveConversationId } from "../../src/services/notification";

type MessageType = {
  _id: string;
  text: string;
  sender: any;
  createdAt: string;
  status?: "sent" | "seen";
  fileUrl?: string;
  fileType?: string;
  isUnsent?: boolean;
};

const EMOJI_LIST = [
  "😀", "😄", "😁", "😂", "🤣", "😊", "😍", "😘", "🥰",
  "😎", "😢", "😭", "😡", "😱", "😴", "🤔", "👍", "👎",
  "👏", "🙏", "💪", "🔥", "❤️", "💔", "🎉", "✨", "⭐",
  "🌹", "☕", "🍕", "🎂", "🎁", "✅", "❌", "📌", "💯",
];

const STICKER_LIST = [
  "😂", "🤣", "😍", "🥰", "😎", "😭", "😡", "😱",
  "🤯", "😴", "👍", "👏", "🙏", "💪", "🔥", "❤️",
  "🎉", "✨", "🐶", "🐱", "🐼", "🐵", "🐧", "🦊",
];

const isStickerMessage = (text?: string) => {
  if (!text) return false;
  return STICKER_LIST.includes(text.trim());
};

export default function ChatScreen() {
  const { id, name, isGroup, avatar } = useLocalSearchParams();
  const router = useRouter();
  const session = getAuthSession();
  const currentUser = session?.user;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [emojiTab, setEmojiTab] = useState<"emoji" | "sticker">("emoji");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [currentGroupName, setCurrentGroupName] = useState(name as string);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const socket = getSocket();

  useEffect(() => {
    fetchMessages();
    setActiveConversationId(id as string);

    if (socket && currentUser) {
      socket.emit("join_chat", id);
      socket.emit("mark_seen", { conversationId: id, userId: currentUser.id });

      const handleReceiveMessage = (newMessage: MessageType) => {
        setMessages((prev) => [...prev, newMessage]);

        socket.emit("mark_seen", {
          conversationId: id,
          userId: currentUser.id,
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };

      const handleMessagesSeen = () => {
        setMessages((prev) => prev.map((m) => ({ ...m, status: "seen" })));
      };

      const handleMessageUnsent = (msgId: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? {
                  ...m,
                  isUnsent: true,
                  text: "Tin nhắn đã bị thu hồi",
                  fileUrl: undefined,
                }
              : m
          )
        );
      };

      const handleIncomingCall = (data: any) => {
        const callTypeName =
          data.callType === "video" ? "Video 📹" : "Thoại 📞";

        Alert.alert(
          `Cuộc gọi ${callTypeName}`,
          `${data.callerName} đang gọi cho bạn...`,
          [
            { text: "Từ chối", style: "cancel" },
            {
              text: "Nghe máy",
              onPress: () =>
                router.push({
                  pathname: "/chat/call",
                  params: {
                    id: id as string,
                    userID: currentUser.id,
                    userName: (currentUser as any).fullName,
                    type: data.callType,
                  },
                }),
            },
          ]
        );
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("messages_seen", handleMessagesSeen);
      socket.on("message_unsent_receive", handleMessageUnsent);
      socket.on("incoming_call", handleIncomingCall);

      return () => {
        setActiveConversationId(null);
        socket.off("receive_message", handleReceiveMessage);
        socket.off("messages_seen", handleMessagesSeen);
        socket.off("message_unsent_receive", handleMessageUnsent);
        socket.off("incoming_call", handleIncomingCall);
      };
    }

    return () => {
      setActiveConversationId(null);
    };
  }, [id, currentUser, socket]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });

      setMessages(await res.json());

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLongPressMessage = (msg: MessageType) => {
    if (msg.isUnsent) return;

    const isMe =
      msg.sender?._id === currentUser?.id || msg.sender === currentUser?.id;

    const options = [
      {
        text: "Xóa ở phía bạn",
        onPress: () => handleDeleteMessage(msg._id, "me"),
      },
      {
        text: "Hủy",
        style: "cancel" as any,
      },
    ];

    if (isMe) {
      options.unshift({
        text: "Thu hồi tin nhắn",
        onPress: () => handleDeleteMessage(msg._id, "everyone"),
      });
    }

    Alert.alert("Tùy chọn", "Bạn muốn làm gì với tin nhắn này?", options);
  };

  const handleDeleteMessage = async (
    msgId: string,
    type: "me" | "everyone"
  ) => {
    try {
      await fetch(`${API_BASE_URL}/chat/message/${msgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ type }),
      });

      if (type === "everyone" && socket) {
        socket.emit("unsend_message", { conversationId: id, msgId });

        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? {
                  ...m,
                  isUnsent: true,
                  text: "Tin nhắn đã bị thu hồi",
                  fileUrl: undefined,
                }
              : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể thực hiện");
    }
  };

  const uploadAndSendFile = async (
    uri: string,
    fileName: string,
    mimeType: string,
    fileType: string
  ) => {
    if (!socket || !currentUser) return;

    const formData = new FormData();

    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}/chat/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      socket.emit("send_message", {
        conversationId: id,
        senderId: currentUser.id,
        text: "",
        fileUrl: uploadData.url,
        fileType,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim() || !socket || !currentUser) return;

    socket.emit("send_message", {
      conversationId: id,
      senderId: currentUser.id,
      text: inputText.trim(),
    });

    setInputText("");
    setShowEmojiPanel(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => `${prev}${emoji}`);
  };

  const handleSendSticker = (sticker: string) => {
    if (!socket || !currentUser) return;

    socket.emit("send_message", {
      conversationId: id,
      senderId: currentUser.id,
      text: sticker,
    });

    setShowEmojiPanel(false);
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAndSendFile(
        result.assets[0].uri,
        "image.jpg",
        "image/jpeg",
        "image"
      );
    }
  };

  const handleRecordAudio = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();

        setRecording(null);

        if (uri) {
          uploadAndSendFile(uri, "audio.m4a", "audio/m4a", "audio");
        }
      } else {
        await Audio.requestPermissionsAsync();

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } =
          await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );

        setRecording(newRecording);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không truy cập được Micro");
    }
  };

  const playAudio = async (url: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
    } catch (error) {}
  };

  const startCall = (type: "video" | "audio") => {
    if (currentUser && socket) {
      socket.emit("call_user", {
        conversationId: id,
        callerName: (currentUser as any).fullName,
        callType: type,
      });

      router.push({
        pathname: "/chat/call",
        params: {
          id: id as string,
          userID: currentUser.id,
          userName: (currentUser as any).fullName,
          type,
        },
      });
    }
  };

  const handlePickGroupAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploadingAvatar(true);

      try {
        const formData = new FormData();

        formData.append("file", {
          uri: result.assets[0].uri,
          name: "group.jpg",
          type: "image/jpeg",
        } as any);

        const uploadRes = await fetch(`${API_BASE_URL}/chat/upload`, {
          method: "POST",
          body: formData,
        });

        const { url } = await uploadRes.json();

        await fetch(`${API_BASE_URL}/chat/group/avatar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({
            chatId: id,
            avatarUrl: url,
          }),
        });

        Alert.alert("Thành công", "Đã cập nhật ảnh nhóm!");
      } catch (e) {
        Alert.alert("Lỗi", "Không thể tải ảnh");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleRenameGroup = async () => {
    if (!currentGroupName.trim()) return;

    try {
      await fetch(`${API_BASE_URL}/chat/group/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          chatId: id,
          chatName: currentGroupName,
        }),
      });

      Alert.alert("Thành công", "Đã đổi tên nhóm!");
      setShowSettings(false);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể đổi tên");
    }
  };

  const formatTime = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const renderMessage = ({
    item,
    index,
  }: {
    item: MessageType;
    index: number;
  }) => {
    const isMe =
      item?.sender?._id === currentUser?.id || item?.sender === currentUser?.id;

    const isLastMessage = index === messages.length - 1;
    const timeString = formatTime(item?.createdAt);

    const fileUrl = item?.fileUrl?.startsWith("/")
      ? `${API_BASE_URL.replace("/api", "")}${item.fileUrl}`
      : item?.fileUrl;

    return (
      <Pressable
        onLongPress={() => handleLongPressMessage(item)}
        style={[styles.msgRow, isMe ? styles.msgRight : styles.msgLeft]}
      >
        {!isMe &&
          (item?.sender?.avatar ? (
            <Image
              source={{ uri: item.sender.avatar }}
              style={styles.senderAvatar}
            />
          ) : (
            <View style={styles.senderAvatarPlaceholder}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                {item?.sender?.fullName?.[0] || "U"}
              </Text>
            </View>
          ))}

        <View
          style={{
            alignItems: isMe ? "flex-end" : "flex-start",
            maxWidth: isMe ? "100%" : "85%",
          }}
        >
          {item.isUnsent ? (
            <View
              style={[
                styles.msgBubble,
                {
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: "#374151",
                },
              ]}
            >
              <Text style={{ color: "#6b7280", fontStyle: "italic" }}>
                Tin nhắn đã bị thu hồi
              </Text>
            </View>
          ) : (
            <>
              {item?.fileUrl && item?.fileType === "image" && (
                <View>
                  <Image source={{ uri: fileUrl }} style={styles.msgImage} />

                  <Text
                    style={[
                      styles.msgTime,
                      isMe ? styles.msgTimeRight : styles.msgTimeLeft,
                      { marginTop: 2, marginRight: 4 },
                    ]}
                  >
                    {timeString}
                  </Text>
                </View>
              )}

              {item?.fileUrl && item?.fileType === "audio" && (
                <Pressable
                  onPress={() => playAudio(fileUrl!)}
                  style={[
                    styles.msgBubble,
                    isMe ? styles.bubbleRight : styles.bubbleLeft,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  <Ionicons
                    name="play-circle"
                    size={28}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />

                  <View>
                    <Text style={styles.msgText}>Tin nhắn thoại</Text>

                    <Text
                      style={[
                        styles.msgTime,
                        isMe ? styles.msgTimeRight : styles.msgTimeLeft,
                      ]}
                    >
                      {timeString}
                    </Text>
                  </View>
                </Pressable>
              )}

              {!item?.fileUrl &&
                (isStickerMessage(item?.text) ? (
                  <View
                    style={[
                      styles.stickerBubble,
                      isMe ? styles.stickerRight : styles.stickerLeft,
                    ]}
                  >
                    <Text style={styles.stickerText}>{item?.text}</Text>

                    <Text
                      style={[
                        styles.msgTime,
                        isMe ? styles.msgTimeRight : styles.msgTimeLeft,
                      ]}
                    >
                      {timeString}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.msgBubble,
                      isMe ? styles.bubbleRight : styles.bubbleLeft,
                    ]}
                  >
                    <Text style={styles.msgText}>{item?.text}</Text>

                    <Text
                      style={[
                        styles.msgTime,
                        isMe ? styles.msgTimeRight : styles.msgTimeLeft,
                      ]}
                    >
                      {timeString}
                    </Text>
                  </View>
                ))}
            </>
          )}

          {isMe && isLastMessage && (
            <Text style={styles.statusText}>
              {item?.status === "seen" ? "Đã xem" : "Đã gửi"}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };
    return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>

          {avatar ? (
            <Image
              source={{ uri: avatar as string }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {currentGroupName?.[0] || "U"}
              </Text>
            </View>
          )}

          <Pressable
            style={styles.headerInfo}
            onPress={() => {
              if (isGroup === "true") setShowSettings(true);
            }}
          >
            <Text style={styles.headerTitle}>
              {currentGroupName || "Đang tải..."}{" "}
              {isGroup === "true" && (
                <Ionicons
                  name="settings-sharp"
                  size={14}
                  color="#9ca3af"
                  style={{ marginLeft: 5 }}
                />
              )}
            </Text>

            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </Pressable>

          <Pressable onPress={() => startCall("audio")} style={{ padding: 8 }}>
            <Ionicons name="call" size={22} color="#22c55e" />
          </Pressable>

          <Pressable
            onPress={() => startCall("video")}
            style={{ padding: 8, marginRight: 4 }}
          >
            <Ionicons name="videocam" size={26} color="#22c55e" />
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatArea}
        />

        {showEmojiPanel && (
          <View style={styles.emojiPanel}>
            <View style={styles.emojiTabs}>
              <Pressable
                style={[
                  styles.emojiTab,
                  emojiTab === "emoji" && styles.emojiTabActive,
                ]}
                onPress={() => setEmojiTab("emoji")}
              >
                <Text
                  style={[
                    styles.emojiTabText,
                    emojiTab === "emoji" && styles.emojiTabTextActive,
                  ]}
                >
                  Emoji
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.emojiTab,
                  emojiTab === "sticker" && styles.emojiTabActive,
                ]}
                onPress={() => setEmojiTab("sticker")}
              >
                <Text
                  style={[
                    styles.emojiTabText,
                    emojiTab === "sticker" && styles.emojiTabTextActive,
                  ]}
                >
                  Sticker
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.emojiGrid}
            >
              {emojiTab === "emoji"
                ? EMOJI_LIST.map((emoji) => (
                    <Pressable
                      key={emoji}
                      style={styles.emojiItem}
                      onPress={() => handleSelectEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </Pressable>
                  ))
                : STICKER_LIST.map((sticker) => (
                    <Pressable
                      key={sticker}
                      style={styles.stickerItem}
                      onPress={() => handleSendSticker(sticker)}
                    >
                      <Text style={styles.stickerItemText}>{sticker}</Text>
                    </Pressable>
                  ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputArea}>
          <Pressable
            onPress={() => {
              setEmojiTab("emoji");
              setShowEmojiPanel((prev) => !prev);
            }}
            style={styles.attachBtn}
          >
            <Ionicons
              name={showEmojiPanel ? "happy" : "happy-outline"}
              size={25}
              color={showEmojiPanel ? "#facc15" : "#8f96a3"}
            />
          </Pressable>

          <Pressable onPress={handlePickImage} style={styles.attachBtn}>
            <Ionicons name="image-outline" size={24} color="#8f96a3" />
          </Pressable>

          <Pressable onPress={handleRecordAudio} style={styles.attachBtn}>
            <Ionicons
              name={recording ? "stop-circle" : "mic-outline"}
              size={26}
              color={recording ? "#ef4444" : "#8f96a3"}
            />
          </Pressable>

          <TextInput
            style={[styles.input, recording && { backgroundColor: "#3f1a1a" }]}
            placeholder={recording ? "Đang ghi âm..." : "Nhập tin nhắn..."}
            placeholderTextColor={recording ? "#ef4444" : "#6b7280"}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!recording}
            onFocus={() => setShowEmojiPanel(false)}
          />

          <Pressable
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSendText}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>

        <Modal visible={showSettings} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cài đặt nhóm</Text>

                <Pressable onPress={() => setShowSettings(false)}>
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </Pressable>
              </View>

              <Pressable
                style={styles.avatarBtn}
                onPress={handlePickGroupAvatar}
              >
                <Ionicons name="camera-outline" size={32} color="#9ca3af" />

                <Text style={styles.avatarBtnText}>
                  {uploadingAvatar
                    ? "Đang tải lên..."
                    : "Đổi ảnh đại diện nhóm"}
                </Text>
              </Pressable>

              <Text style={styles.inputLabel}>Tên nhóm mới</Text>

              <TextInput
                style={styles.nameInput}
                value={currentGroupName}
                onChangeText={setCurrentGroupName}
                placeholderTextColor="#6b7280"
              />

              <Pressable style={styles.saveBtn} onPress={handleRenameGroup}>
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#0a0a0a",
  },
  backBtn: {
    marginRight: 10,
    padding: 5,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerStatus: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: 2,
  },
  chatArea: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  msgRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  msgLeft: {
    justifyContent: "flex-start",
  },
  msgRight: {
    justifyContent: "flex-end",
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  senderAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 2,
    backgroundColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleLeft: {
    backgroundColor: "#1f2937",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: "#1e5eff",
    borderBottomRightRadius: 4,
  },
  msgText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 2,
    alignSelf: "flex-end",
  },
  msgTimeLeft: {
    color: "#9ca3af",
  },
  msgTimeRight: {
    color: "#dbeafe",
  },
  msgImage: {
    width: 200,
    height: 250,
    borderRadius: 14,
    marginBottom: 4,
  },
  statusText: {
    color: "#8f96a3",
    fontSize: 11,
    marginTop: 2,
    marginRight: 4,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    backgroundColor: "#0a0a0a",
  },
  attachBtn: {
    marginRight: 8,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderRadius: 20,
    color: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  stickerBubble: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stickerRight: {
    alignSelf: "flex-end",
  },
  stickerLeft: {
    alignSelf: "flex-start",
  },
  stickerText: {
    fontSize: 58,
    lineHeight: 68,
  },
  emojiPanel: {
    height: 255,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    backgroundColor: "#0f1115",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  emojiTabs: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderRadius: 14,
    padding: 4,
    marginBottom: 10,
  },
  emojiTab: {
    flex: 1,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiTabActive: {
    backgroundColor: "#1e5eff",
  },
  emojiTabText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "700",
  },
  emojiTabTextActive: {
    color: "#ffffff",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 18,
  },
  emojiItem: {
    width: "12.5%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 26,
  },
  stickerItem: {
    width: "25%",
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stickerItemText: {
    fontSize: 46,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#111214",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarBtn: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  avatarBtnText: {
    color: "#94a3b8",
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 13,
  },
  inputLabel: {
    color: "#94a3b8",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  nameInput: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#1e5eff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
