
import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { DeviceEventEmitter, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getSocket } from "../src/services/socket";
import { MESSAGE_NOTIFICATION_EVENT } from "../src/services/notification";

type IncomingCall = {
  call: any;
  userId: string;
  userName: string;
};

type MessageToast = {
  title: string;
  body: string;
  conversationId?: string;
};

export default function RootLayout() {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [messageToast, setMessageToast] = useState<MessageToast | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          conversationId?: string;
          senderName?: string;
        };

        if (data?.conversationId) {
          router.push({
            pathname: "/chat/[id]",
            params: {
              id: data.conversationId,
              name: data.senderName || "Tin nhắn",
            },
          });
        }
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleIncomingCall = (event: Event) => {
      setIncomingCall((event as CustomEvent<IncomingCall>).detail);
    };

    const handleCallExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ callId?: string }>).detail;
      setIncomingCall((current) => {
        if (!current) return current;
        const currentCallId = current.call.callId || current.call.conversationId;
        if (String(currentCallId) !== String(detail?.callId || "")) return current;
        return null;
      });
    };

    window.addEventListener("finchat-incoming-call", handleIncomingCall);
    window.addEventListener("finchat-call-expired", handleCallExpired);
    return () => {
      window.removeEventListener("finchat-incoming-call", handleIncomingCall);
      window.removeEventListener("finchat-call-expired", handleCallExpired);
    };
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const showToast = (toast: MessageToast) => {
      setMessageToast(toast);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setMessageToast(null), 4500);
    };

    if (Platform.OS === "web") {
      const handleMessageToast = (event: Event) => {
        showToast((event as CustomEvent<MessageToast>).detail);
      };

      window.addEventListener(MESSAGE_NOTIFICATION_EVENT, handleMessageToast);
      return () => {
        if (hideTimer) clearTimeout(hideTimer);
        window.removeEventListener(MESSAGE_NOTIFICATION_EVENT, handleMessageToast);
      };
    }

    const subscription = DeviceEventEmitter.addListener(
      MESSAGE_NOTIFICATION_EVENT,
      showToast
    );

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      subscription.remove();
    };
  }, []);

  const acceptIncomingCall = () => {
    if (!incomingCall) return;

    const socket = getSocket();
    const { call, userId, userName } = incomingCall;

    if (call.expiresAt && Date.now() > Number(call.expiresAt)) {
      setIncomingCall(null);
      if (Platform.OS === "web") {
        window.alert("Cuộc gọi này đã hết hạn");
      }
      return;
    }

    socket?.emit("accept_call", {
      ...call,
      acceptedUserId: userId,
      acceptedUserName: userName,
    });

    setIncomingCall(null);
    router.push({
      pathname: "/chat/call",
      params: {
        id: call.conversationId,
        callId: call.callId || call.conversationId,
        role: "callee",
        accepted: "true",
        callerId: call.callerId || "",
        userID: userId,
        userName,
        remoteName: call.callerName || "Người gọi",
        isGroupCall: call.isGroupCall ? "true" : "false",
        type: call.callType,
      },
    });
  };

  const rejectIncomingCall = () => {
    if (!incomingCall) return;

    getSocket()?.emit("reject_call", {
      ...incomingCall.call,
      rejectedUserId: incomingCall.userId,
    });

    setIncomingCall(null);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#050505" },
        }}
      />
      {messageToast && (
        <Pressable
          style={styles.messageToast}
          onPress={() => {
            const conversationId = messageToast.conversationId;
            setMessageToast(null);
            if (conversationId) {
              router.push({
                pathname: "/chat/[id]",
                params: { id: conversationId, name: messageToast.title },
              });
            }
          }}
        >
          <Text style={styles.toastTitle}>{messageToast.title}</Text>
          <Text style={styles.toastBody} numberOfLines={2}>
            {messageToast.body}
          </Text>
        </Pressable>
      )}
      <Modal visible={!!incomingCall} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.callCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {incomingCall?.call?.callerName?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.title}>
              {incomingCall?.call?.callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"}
            </Text>
            <Text style={styles.subtitle}>
              {incomingCall?.call?.callerName || "Ai đó"} đang gọi cho bạn
            </Text>
            <View style={styles.actions}>
              <Pressable style={[styles.actionButton, styles.rejectButton]} onPress={rejectIncomingCall}>
                <Text style={styles.actionText}>Từ chối</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.acceptButton]} onPress={acceptIncomingCall}>
                <Text style={styles.actionText}>Nghe máy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 24,
  },
  callCard: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#111827",
    padding: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e5eff",
    marginBottom: 16,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    minWidth: 112,
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  acceptButton: {
    backgroundColor: "#22c55e",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  messageToast: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 100,
    borderRadius: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.35)",
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  toastTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  toastBody: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 4,
  },
});
