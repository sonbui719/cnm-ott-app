
import { useEffect } from "react";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";

export default function RootLayout() {
  useEffect(() => {
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
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#050505" },
      }}
    />
  );
}
