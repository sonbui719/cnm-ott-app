import { io, Socket } from "socket.io-client";
<<<<<<< HEAD
import { API_BASE_URL } from "../config/api";
=======
import { router } from "expo-router";
import { Alert, Platform } from "react-native";
import { API_BASE_URL } from "../config/api";
import { getAuthSession } from "../store/authStore";
import {
  configureMessageNotifications,
  setCurrentNotificationUser,
  showIncomingMessageNotification,
} from "./notification";
>>>>>>> main

const SOCKET_URL = API_BASE_URL.replace("/api", "");
let socket: Socket | null = null;

export const initiateSocket = (userId: string) => {
<<<<<<< HEAD
=======
  setCurrentNotificationUser(userId);

  configureMessageNotifications().catch((error) => {
    console.log("Không thể cấu hình thông báo:", error);
  });

>>>>>>> main
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
<<<<<<< HEAD
  }
=======

    socket.on("receive_message", (message) => {
      showIncomingMessageNotification(message);
    });

    socket.on("incoming_call", (data) => {
      if (String(data.callerId || "") === String(userId)) return;

      const session = getAuthSession();
      const openCall = () => {
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
        if (window.confirm(`${data.callerName || "Ai do"} dang goi. Ban co muon nghe may?`)) {
          openCall();
        } else {
          rejectCall();
        }
        return;
      }

      Alert.alert(
        data.callType === "video" ? "Cuoc goi video" : "Cuoc goi thoai",
        `${data.callerName || "Ai do"} dang goi cho ban...`,
        [
          { text: "Tu choi", style: "cancel", onPress: rejectCall },
          { text: "Nghe may", onPress: openCall },
        ]
      );
    });
  }

>>>>>>> main
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
<<<<<<< HEAD
  }
};
=======
    setCurrentNotificationUser(null);
  }
};
>>>>>>> main
