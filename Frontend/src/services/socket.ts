import { io, Socket } from "socket.io-client";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";
import { API_BASE_URL } from "../config/api";
import { getAuthSession } from "../store/authStore";
import {
  configureMessageNotifications,
  setCurrentNotificationUser,
  showIncomingMessageNotification,
} from "./notification";

const SOCKET_URL = API_BASE_URL.replace("/api", "");
let socket: Socket | null = null;

export const initiateSocket = (userId: string) => {
  setCurrentNotificationUser(userId);

  configureMessageNotifications().catch((error) => {
    console.log("Không thể cấu hình thông báo:", error);
  });

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Đã kết nối Socket server:", socket?.id);
      socket?.emit("user_connected", userId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Mất kết nối Socket");
    });

    socket.on("receive_message", (message) => {
      showIncomingMessageNotification(message);
    });

    socket.on("incoming_call", (data) => {
      if (String(data.callerId || "") === String(userId)) return;

      const session = getAuthSession();
      const openCall = () => {
        if (data.expiresAt && Date.now() > Number(data.expiresAt)) {
          Alert.alert("Cuộc gọi đã kết thúc", "Cuộc gọi này đã hết hạn");
          return;
        }

        socket?.emit("accept_call", {
          ...data,
          acceptedUserId: userId,
          acceptedUserName: session?.user?.fullName || userId,
        });

        router.push({
          pathname: "/chat/call",
          params: {
            id: data.conversationId,
            callId: data.callId || data.conversationId,
            role: "callee",
            accepted: "true",
            callerId: data.callerId || "",
            userID: userId,
            userName: session?.user?.fullName || userId,
            remoteName: data.callerName || "Người gọi",
            isGroupCall: data.isGroupCall ? "true" : "false",
            type: data.callType,
          },
        });
      };

      const rejectCall = () => {
        socket?.emit("reject_call", {
          ...data,
          rejectedUserId: userId,
        });
      };

      if (Platform.OS === "web") {
        window.dispatchEvent(
          new CustomEvent("finchat-incoming-call", {
            detail: {
              call: data,
              userId,
              userName: session?.user?.fullName || userId,
            },
          })
        );
        return;
      }

      Alert.alert(
        data.callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại",
        `${data.callerName || "Ai đó"} đang gọi cho bạn...`,
        [
          { text: "Từ chối", style: "cancel", onPress: rejectCall },
          { text: "Nghe máy", onPress: openCall },
        ]
      );
    });

    socket.on("call_missed", (data) => {
      if (String(data.callerId || "") === String(userId)) return;
      if (Platform.OS === "web") {
        window.dispatchEvent(
          new CustomEvent("finchat-call-expired", {
            detail: { callId: data.callId || data.conversationId },
          })
        );
        return;
      }

      Alert.alert(
        "Cuộc gọi nhỡ",
        `${data.callerName || "Ai đó"} đã gọi nhưng bạn không nghe máy`
      );
    });

    socket.on("call_timeout", (data) => {
      if (String(data.callerId || "") === String(userId)) return;
      Alert.alert("Cuộc gọi kết thúc", data.message || "Cuộc gọi đã hết hạn");
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    setCurrentNotificationUser(null);
  }
};
