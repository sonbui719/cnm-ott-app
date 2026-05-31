import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { getSocket, initiateSocket } from "../../src/services/socket";
import { setActiveConversationId } from "../../src/services/notification";

type MessageType = {
  _id: string;
  text: string;
  sender: any;
  createdAt: string;
  status?: "sent" | "seen";
  fileUrl?: string;
  fileType?: string;
  callInfo?: {
    callId?: string;
    callType?: "audio" | "video";
    status?: string;
    durationSeconds?: number;
    callerId?: string;
    callerName?: string;
    isGroupCall?: boolean;
    endedAt?: string | null;
  };
  isUnsent?: boolean;
};

type ChatUser = {
  _id?: string;
  id?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  department?: string;
  position?: string;
  intro?: string;
};

type ChatDetail = {
  _id: string;
  chatName?: string;
  isGroupChat?: boolean;
  groupAvatar?: string;
  participants?: ChatUser[];
  groupAdmin?: ChatUser | string;
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

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [lastSuggestedMsgId, setLastSuggestedMsgId] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [currentGroupName, setCurrentGroupName] = useState(name as string);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<ChatUser[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const shouldStickToBottomRef = useRef(true);
  const socket = useMemo(
    () => (currentUser?.id ? getSocket() || initiateSocket(currentUser.id) : null),
    [currentUser?.id]
  );
  const isGroupChat = isGroup === "true" || !!chatDetail?.isGroupChat;
  const groupMembers = chatDetail?.participants || [];
  const groupAdminId =
    typeof chatDetail?.groupAdmin === "string"
      ? chatDetail.groupAdmin
      : chatDetail?.groupAdmin?._id || chatDetail?.groupAdmin?.id || "";
  const currentUserId = String(currentUser?.id || "");
  const isCurrentUserGroupAdmin = !!groupAdminId && groupAdminId === currentUserId;
  const otherParticipant = groupMembers.find(
    (participant) => String(participant._id || participant.id || "") !== currentUserId
  );

  useEffect(() => {
    fetchMessages();
    fetchChatDetail();
    setActiveConversationId(id as string);

    if (socket && currentUser) {
      socket.emit("join_chat", id);
      socket.emit("mark_seen", { conversationId: id, userId: currentUser.id });

      const handleReceiveMessage = (newMessage: MessageType) => {
        const isOwnMessage =
          newMessage?.sender?._id === currentUser.id ||
          newMessage?.sender === currentUser.id;
        const shouldScroll = shouldStickToBottomRef.current || isOwnMessage;

        setMessages((prev) =>
          prev.some((message) => message._id === newMessage._id)
            ? prev.map((message) =>
                message._id === newMessage._id ? newMessage : message
              )
            : [...prev, newMessage]
        );

        socket.emit("mark_seen", {
          conversationId: id,
          userId: currentUser.id,
        });

        if (shouldScroll) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      };

      const handleMessagesSeen = () => {
        setMessages((prev) => prev.map((m) => ({ ...m, status: "seen" })));
      };

      const handleCallMessageUpdated = (updatedMessage: MessageType) => {
        setMessages((prev) =>
          prev.some((message) => message._id === updatedMessage._id)
            ? prev.map((message) =>
                message._id === updatedMessage._id ? updatedMessage : message
              )
            : [...prev, updatedMessage]
        );
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

        if (Platform.OS === "web") {
          const accepted = window.confirm(
            `${data.callerName} đang gọi. Bạn có muốn nghe máy?`
          );

          if (accepted) {
            router.push({
              pathname: "/chat/call",
              params: {
                id: id as string,
                userID: currentUser.id,
                userName: (currentUser as any).fullName,
                type: data.callType,
              },
            });
          }
          return;
        }

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
      socket.on("call_message_updated", handleCallMessageUpdated);
      socket.on("messages_seen", handleMessagesSeen);
      socket.on("message_unsent_receive", handleMessageUnsent);

      return () => {
        setActiveConversationId(null);
        socket.off("receive_message", handleReceiveMessage);
        socket.off("call_message_updated", handleCallMessageUpdated);
        socket.off("messages_seen", handleMessagesSeen);
        socket.off("message_unsent_receive", handleMessageUnsent);
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
      shouldStickToBottomRef.current = true;

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

  const fetchChatDetail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });

      if (!res.ok) return;

      const chat = await res.json();
      setChatDetail(chat);
      if (chat?.chatName) setCurrentGroupName(chat.chatName);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessagesScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;

    shouldStickToBottomRef.current = distanceFromBottom < 80;
  };

  const uploadAndSendFile = async (
    uri: string,
    fileName: string,
    mimeType: string,
    fileType: string
  ) => {
    if (!socket || !currentUser) return;

    const formData = new FormData();

    if (Platform.OS === "web") {
      const fileResponse = await fetch(uri);
      const fileBlob = await fileResponse.blob();
      formData.append("file", fileBlob, fileName);
    } else {
      formData.append("file", {
        uri,
        name: fileName,
        type: mimeType,
      } as any);
    }

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

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const isMe = lastMsg.sender?._id === currentUser?.id || lastMsg.sender === currentUser?.id;
      const msgIdentifier = lastMsg._id || lastMsg.text;
      
      if (!isMe && lastMsg.text && !isStickerMessage(lastMsg.text)) {
        if (msgIdentifier !== lastSuggestedMsgId) {
          setLastSuggestedMsgId(msgIdentifier);
          fetchSuggestions();
        }
      } else if (isMe) {
        setSuggestions([]); 
        if (msgIdentifier !== lastSuggestedMsgId) {
          setLastSuggestedMsgId(msgIdentifier);
        }
      }
    }
  }, [messages, currentUser]);

  const fetchSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const recentMessages = messages.slice(-5).map(m => {
        const isMe = m.sender?._id === currentUser?.id || m.sender === currentUser?.id;
        return `${isMe ? "Tôi" : "Bạn"}: ${m.text || "[Hình ảnh/Âm thanh]"}`;
      }).join("\n");

      const res = await fetch(`${API_BASE_URL}/ai-suggest-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: recentMessages })
      });
      const data = await res.json();
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Lỗi lấy gợi ý AI:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim() || !socket || !currentUser) return;

    shouldStickToBottomRef.current = true;

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

    shouldStickToBottomRef.current = true;

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

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Lỗi", "Bạn cần cấp quyền Camera để chụp ảnh");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAndSendFile(
        result.assets[0].uri,
        "camera.jpg",
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
    const activeSocket =
      currentUser?.id ? getSocket() || initiateSocket(currentUser.id) : null;

    if (currentUser && activeSocket) {
      const callId = `${id}-${Date.now()}`;

      activeSocket.emit("call_user", {
        conversationId: id,
        callId,
        callerId: currentUser.id,
        callerName: (currentUser as any).fullName,
        callType: type,
        isGroupCall: isGroup === "true",
      });

      router.push({
        pathname: "/chat/call",
        params: {
          id: id as string,
          callId,
          role: "caller",
          accepted: "false",
          callerId: currentUser.id,
          userID: currentUser.id,
          userName: (currentUser as any).fullName,
          remoteName: name as string,
          isGroupCall: isGroup === "true" ? "true" : "false",
          type,
        },
      });
    } else {
      Alert.alert("Lỗi", "Chưa kết nối được máy chủ cuộc gọi");
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

        const updateRes = await fetch(`${API_BASE_URL}/chat/group/avatar`, {
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
        const updatedChat = await updateRes.json();
        setChatDetail(updatedChat);

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
      const res = await fetch(`${API_BASE_URL}/chat/group/rename`, {
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
      const updatedChat = await res.json();
      setChatDetail(updatedChat);
      if (updatedChat?.chatName) setCurrentGroupName(updatedChat.chatName);

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

  const formatCallDuration = (seconds?: number) => {
    const totalSeconds = Math.max(0, Number(seconds || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes <= 0) return `${remainingSeconds} giây`;
    if (remainingSeconds <= 0) return `${minutes} phút`;
    return `${minutes} phút ${remainingSeconds} giây`;
  };

  const searchMembersToAdd = async () => {
    if (!memberSearch.trim()) {
      setMemberResults([]);
      return;
    }

    setMemberSearching(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(memberSearch.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );
      const users = await res.json();
      const existingIds = new Set(
        groupMembers.map((member) => String(member._id || member.id || ""))
      );

      setMemberResults(
        (Array.isArray(users) ? users : []).filter(
          (user) => !existingIds.has(String(user._id || user.id || ""))
        )
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm người dùng");
    } finally {
      setMemberSearching(false);
    }
  };

  const updateGroupMembers = async (
    endpoint: "add" | "remove" | "admin",
    payload: Record<string, any>
  ) => {
    const url =
      endpoint === "admin"
        ? `${API_BASE_URL}/chat/group/admin`
        : `${API_BASE_URL}/chat/group/members/${endpoint}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token}`,
      },
      body: JSON.stringify({
        chatId: id,
        ...payload,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Không thể cập nhật nhóm");

    setChatDetail(data);
    setMemberResults([]);
    setMemberSearch("");
    return data;
  };

  const handleAddMember = async (userId?: string) => {
    if (!userId) return;

    try {
      await updateGroupMembers("add", { userIds: [userId] });
      Alert.alert("Thành công", "Đã thêm thành viên vào nhóm");
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể thêm thành viên");
    }
  };

  const handleRemoveMember = async (user: ChatUser) => {
    const userId = user._id || user.id;
    if (!userId) return;

    const run = async () => {
      try {
        await updateGroupMembers("remove", { userId });
        Alert.alert("Thành công", "Đã xóa thành viên khỏi nhóm");
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể xóa thành viên");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Xóa ${user.fullName || "thành viên này"} khỏi nhóm?`)) {
        run();
      }
      return;
    }

    Alert.alert("Xóa thành viên", `Xóa ${user.fullName || "thành viên này"} khỏi nhóm?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: run },
    ]);
  };

  const handlePromoteAdmin = async (user: ChatUser) => {
    const userId = user._id || user.id;
    if (!userId) return;

    const run = async () => {
      try {
        await updateGroupMembers("admin", { userId });
        Alert.alert("Thành công", `${user.fullName || "Thành viên"} đã là nhóm trưởng`);
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể đổi nhóm trưởng");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Bổ nhiệm ${user.fullName || "thành viên này"} làm nhóm trưởng?`)) {
        run();
      }
      return;
    }

    Alert.alert("Bổ nhiệm nhóm trưởng", `Bổ nhiệm ${user.fullName || "thành viên này"} làm nhóm trưởng?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Bổ nhiệm", onPress: run },
    ]);
  };

  const openHeaderInfo = () => {
    if (isGroupChat) {
      setShowSettings(true);
      return;
    }

    const userId = otherParticipant?._id || otherParticipant?.id;
    if (!userId) return;

    router.push({
      pathname: "/profile/[id]",
      params: { id: userId },
    } as any);
  };

  const displayedMessages = useMemo(() => {
    const keyword = messageSearch.trim().toLowerCase();
    if (!keyword) return messages;

    return messages.filter((message) => {
      const senderName = String(message.sender?.fullName || "").toLowerCase();
      const text = String(message.text || "").toLowerCase();
      return text.includes(keyword) || senderName.includes(keyword);
    });
  }, [messages, messageSearch]);

  const getCallMessageMeta = (message: MessageType, isMe: boolean) => {
    const callInfo = message.callInfo || {};
    const isVideo = callInfo.callType === "video";
    const typeLabel = isVideo ? "Cuộc gọi video" : "Cuộc gọi thoại";
    const direction = isMe ? "đi" : "đến";
    let title = `${typeLabel} ${direction}`;
    let detail = callInfo.durationSeconds
      ? formatCallDuration(callInfo.durationSeconds)
      : "Đang gọi...";
    let isMissed = false;

    if (callInfo.status === "missed") {
      isMissed = true;
      title = isMe ? `${typeLabel} không phản hồi` : "Bạn bị nhỡ";
      detail = typeLabel;
    } else if (callInfo.status === "unavailable") {
      isMissed = true;
      title = "Người nhận không hoạt động";
      detail = typeLabel;
    } else if (callInfo.status === "rejected") {
      isMissed = true;
      title = `${typeLabel} bị từ chối`;
      detail = "";
    } else if (callInfo.status === "ringing") {
      detail = "Đang gọi...";
    }

    return {
      title,
      detail,
      isMissed,
      iconName: isVideo ? "videocam" : "call",
    };
  };

  const renderCallMessage = (
    message: MessageType,
    isMe: boolean,
    timeString: string
  ) => {
    const meta = getCallMessageMeta(message, isMe);
    const retryType = message.callInfo?.callType === "video" ? "video" : "audio";

    return (
      <View
        style={[
          styles.callHistoryCard,
          isMe ? styles.callHistoryRight : styles.callHistoryLeft,
        ]}
      >
        <Text
          style={[
            styles.callHistoryTitle,
            meta.isMissed && styles.callHistoryMissedTitle,
          ]}
        >
          {meta.title}
        </Text>

        <View style={styles.callHistoryDetailRow}>
          <Ionicons
            name={meta.iconName as any}
            size={18}
            color={meta.isMissed ? "#ef4444" : isMe ? "#bfdbfe" : "#9ca3af"}
          />
          {!!meta.detail && (
            <Text
              style={[
                styles.callHistoryDetail,
                isMe ? styles.callHistoryDetailRight : styles.callHistoryDetailLeft,
              ]}
            >
              {meta.detail}
            </Text>
          )}
          <Text
            style={[
              styles.callHistoryTime,
              isMe ? styles.callHistoryDetailRight : styles.callHistoryDetailLeft,
            ]}
          >
            {timeString}
          </Text>
        </View>

        <View
          style={[
            styles.callHistoryDivider,
            isMe ? styles.callHistoryDividerRight : styles.callHistoryDividerLeft,
          ]}
        />

        <Pressable
          style={styles.callHistoryRetry}
          onPress={() => startCall(retryType)}
        >
          <Text style={styles.callHistoryRetryText}>Gọi lại</Text>
        </Pressable>
      </View>
    );
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: MessageType;
    index: number;
  }) => {
    const isMe =
      item?.sender?._id === currentUser?.id || item?.sender === currentUser?.id;

    const isLastMessage =
      !messageSearch.trim() && index === displayedMessages.length - 1;
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
          ) : item.fileType === "call" ? (
            renderCallMessage(item, isMe, timeString)
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

          {(chatDetail?.groupAvatar || avatar) ? (
            <Image
              source={{ uri: (chatDetail?.groupAvatar || avatar) as string }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {currentGroupName?.[0] || "U"}
              </Text>
            </View>
          )}

          <Pressable style={styles.headerInfo} onPress={openHeaderInfo}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {currentGroupName || "Đang tải..."}{" "}
              {isGroupChat && (
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

          {isGroupChat && (
            <Text style={styles.headerMemberCount}>{groupMembers.length} thành viên</Text>
          )}

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setShowMessageSearch((prev) => !prev)}
              style={styles.callButton}
              hitSlop={10}
            >
              <Ionicons name="search-outline" size={22} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={() => startCall("audio")}
              style={styles.callButton}
              hitSlop={10}
            >
              <Ionicons name="call" size={22} color="#22c55e" />
            </Pressable>

            <Pressable
              onPress={() => startCall("video")}
              style={styles.callButton}
              hitSlop={10}
            >
              <Ionicons name="videocam" size={25} color="#22c55e" />
            </Pressable>
          </View>
        </View>

        {showMessageSearch && (
          <View style={styles.messageSearchBar}>
            <Ionicons name="search-outline" size={18} color="#8f96a3" />
            <TextInput
              style={styles.messageSearchInput}
              value={messageSearch}
              onChangeText={setMessageSearch}
              placeholder="Tìm tin nhắn trong đoạn chat..."
              placeholderTextColor="#6b7280"
              autoFocus
            />
            {!!messageSearch && (
              <Pressable onPress={() => setMessageSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#8f96a3" />
              </Pressable>
            )}
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={displayedMessages}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderMessage}
          style={styles.messageList}
          contentContainerStyle={styles.chatArea}
          ListEmptyComponent={
            messageSearch.trim() ? (
              <View style={styles.emptySearchBox}>
                <Ionicons name="search-outline" size={24} color="#6b7280" />
                <Text style={styles.emptySearchText}>Không tìm thấy tin nhắn</Text>
              </View>
            ) : null
          }
          onScroll={handleMessagesScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
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

        {/* AI Quick Reply Suggestions */}
        {(suggestions.length > 0 || isSuggesting) && (
          <View style={{ backgroundColor: "#0a0a0a", borderTopWidth: 1, borderTopColor: "#1f2937", paddingVertical: 4 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              {isSuggesting && (
                <View style={{ backgroundColor: "#1f2937", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginRight: 8 }}>
                  <Text style={{color: "#8f96a3", fontSize: 13, fontStyle: "italic"}}>AI đang gợi ý...</Text>
                </View>
              )}
              {!isSuggesting && suggestions.map((suggestion, index) => (
                <Pressable 
                  key={index} 
                  style={{ backgroundColor: "#1e5eff", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 }}
                  onPress={() => {
                    setInputText(suggestion); 
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 14 }}>{suggestion}</Text>
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

          <Pressable onPress={handleTakePhoto} style={styles.attachBtn}>
            <Ionicons name="camera-outline" size={24} color="#8f96a3" />
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

              <ScrollView showsVerticalScrollIndicator={false}>
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
              <View style={styles.groupSection}>
                <Text style={styles.groupSectionTitle}>
                  Thành viên nhóm ({groupMembers.length})
                </Text>

                <View style={styles.memberSearchRow}>
                  <TextInput
                    style={styles.memberSearchInput}
                    value={memberSearch}
                    onChangeText={setMemberSearch}
                    placeholder="Tìm người để thêm..."
                    placeholderTextColor="#6b7280"
                    onSubmitEditing={searchMembersToAdd}
                  />
                  <Pressable style={styles.memberSearchBtn} onPress={searchMembersToAdd}>
                    <Text style={styles.memberSearchBtnText}>
                      {memberSearching ? "..." : "Tìm"}
                    </Text>
                  </Pressable>
                </View>

                {memberResults.map((user) => {
                  const userId = user._id || user.id;
                  return (
                    <View key={userId} style={styles.memberRow}>
                      <View style={styles.memberAvatar}>
                        {user.avatar ? (
                          <Image source={{ uri: user.avatar }} style={styles.memberAvatarImage} />
                        ) : (
                          <Text style={styles.memberAvatarText}>{user.fullName?.[0] || "U"}</Text>
                        )}
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{user.fullName || "Người dùng"}</Text>
                        <Text style={styles.memberSub}>{user.phone || user.email || ""}</Text>
                      </View>
                      <Pressable style={styles.memberActionBtn} onPress={() => handleAddMember(userId)}>
                        <Text style={styles.memberActionText}>Thêm</Text>
                      </Pressable>
                    </View>
                  );
                })}

                {groupMembers.map((member) => {
                  const memberId = member._id || member.id || "";
                  const isAdmin = memberId === groupAdminId;
                  const isSelf = memberId === currentUserId;

                  return (
                    <View key={memberId} style={styles.memberRow}>
                      <Pressable
                        style={styles.memberAvatar}
                        onPress={() =>
                          router.push({
                            pathname: "/profile/[id]",
                            params: { id: memberId },
                          } as any)
                        }
                      >
                        {member.avatar ? (
                          <Image source={{ uri: member.avatar }} style={styles.memberAvatarImage} />
                        ) : (
                          <Text style={styles.memberAvatarText}>{member.fullName?.[0] || "U"}</Text>
                        )}
                      </Pressable>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>
                          {member.fullName || "Người dùng"} {isSelf ? "(Bạn)" : ""}
                        </Text>
                        <Text style={styles.memberSub}>
                          {isAdmin ? "Nhóm trưởng" : "Thành viên"}
                        </Text>
                      </View>

                      {isCurrentUserGroupAdmin && !isAdmin && (
                        <View style={styles.memberActions}>
                          <Pressable
                            style={styles.memberSmallBtn}
                            onPress={() => handlePromoteAdmin(member)}
                          >
                            <Text style={styles.memberSmallText}>Bổ nhiệm</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.memberSmallBtn, styles.memberDangerBtn]}
                            onPress={() => handleRemoveMember(member)}
                          >
                            <Text style={styles.memberDangerText}>Xóa</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              </ScrollView>
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
    minWidth: 0,
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
  headerMemberCount: {
    color: "#93c5fd",
    fontSize: 12,
    marginRight: 4,
    maxWidth: 82,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  messageSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#0a0a0a",
  },
  messageSearchInput: {
    flex: 1,
    color: "#fff",
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  emptySearchBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptySearchText: {
    color: "#8f96a3",
    marginTop: 8,
    fontSize: 14,
  },
  messageList: {
    flex: 1,
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
  callHistoryCard: {
    minWidth: 190,
    maxWidth: 260,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderWidth: 1,
  },
  callHistoryLeft: {
    backgroundColor: "#111827",
    borderColor: "#263244",
  },
  callHistoryRight: {
    backgroundColor: "#1d4ed8",
    borderColor: "#2563eb",
  },
  callHistoryTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  callHistoryMissedTitle: {
    color: "#f87171",
  },
  callHistoryDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  callHistoryDetail: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  callHistoryDetailLeft: {
    color: "#9ca3af",
  },
  callHistoryDetailRight: {
    color: "#dbeafe",
  },
  callHistoryTime: {
    marginLeft: 8,
    fontSize: 11,
  },
  callHistoryDivider: {
    height: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  callHistoryDividerLeft: {
    backgroundColor: "#263244",
  },
  callHistoryDividerRight: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  callHistoryRetry: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
  },
  callHistoryRetryText: {
    color: "#60a5fa",
    fontSize: 15,
    fontWeight: "800",
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
    maxHeight: "86%",
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
    marginBottom: 18,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  groupSection: {
    borderTopWidth: 1,
    borderTopColor: "#263244",
    paddingTop: 16,
    paddingBottom: 10,
  },
  groupSectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  memberSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  memberSearchInput: {
    flex: 1,
    color: "#fff",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  memberSearchBtn: {
    backgroundColor: "#1e5eff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  memberSearchBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  memberAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  memberAvatarText: {
    color: "#fff",
    fontWeight: "800",
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  memberSub: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  memberActionBtn: {
    backgroundColor: "#1d4ed8",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  memberActionText: {
    color: "#fff",
    fontWeight: "800",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberSmallBtn: {
    borderRadius: 8,
    backgroundColor: "#172554",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  memberSmallText: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "800",
  },
  memberDangerBtn: {
    backgroundColor: "#3f1a1a",
  },
  memberDangerText: {
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: "800",
  },
});
