import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

type IncomingMessage = {
  _id?: string;
  conversationId?: string;
  text?: string;
  sender?: {
    _id?: string;
    id?: string;
    fullName?: string;
  } | string;
  fileType?: string | null;
  isUnsent?: boolean;
};

let notificationReady = false;
let currentUserId: string | null = null;
let activeConversationId: string | null = null;

const MESSAGE_CHANNEL_ID = "messages";

export const setCurrentNotificationUser = (userId?: string | null) => {
  currentUserId = userId ?? null;
};

export const setActiveConversationId = (conversationId?: string | null) => {
  activeConversationId = conversationId ? String(conversationId) : null;
};

export const configureMessageNotifications = async () => {
  if (notificationReady) return true;

  Notifications.setNotificationHandler({
    handleNotification: async () =>
      ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      } as any),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(MESSAGE_CHANNEL_ID, {
      name: "Tin nhắn",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
      sound: "default",
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== "granted") {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  notificationReady = finalStatus === "granted";
  return notificationReady;
};

const getSenderId = (sender: IncomingMessage["sender"]) => {
  if (!sender) return null;
  if (typeof sender === "string") return sender;
  return sender._id || sender.id || null;
};

const getSenderName = (sender: IncomingMessage["sender"]) => {
  if (!sender || typeof sender === "string") return "Tin nhắn mới";
  return sender.fullName || "Tin nhắn mới";
};

const getMessagePreview = (message: IncomingMessage) => {
  if (message.isUnsent) return "Tin nhắn đã bị thu hồi";
  if (message.fileType === "image") return "Đã gửi một ảnh";
  if (message.fileType === "audio") return "Đã gửi tin nhắn thoại";
  return message.text?.trim() || "Bạn có tin nhắn mới";
};

export const showIncomingMessageNotification = async (message: IncomingMessage) => {
  try {
    const senderId = getSenderId(message.sender);
    const conversationId = message.conversationId ? String(message.conversationId) : null;

    if (senderId && currentUserId && senderId === currentUserId) return;
    if (conversationId && activeConversationId === conversationId) return;

    const canShowNotification = await configureMessageNotifications();
    if (!canShowNotification) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: getSenderName(message.sender),
        body: getMessagePreview(message),
        sound: "default",
        data: {
          conversationId,
          senderName: getSenderName(message.sender),
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.log("Không thể hiển thị thông báo tin nhắn:", error);
  }
};