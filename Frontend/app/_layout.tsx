<<<<<<< HEAD
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#050505" },
      }}
    />
  );
}
=======

import "react-native-gesture-handler";
import { useEffect } from "react";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#050505" },
        }}
      />
    </GestureHandlerRootView>
  );
}
>>>>>>> main
