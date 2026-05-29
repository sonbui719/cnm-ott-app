import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function UnsupportedCallScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  const callType = type === "video" ? "Video call" : "Voice call";

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>{callType} chua ho tro tren nen tang nay</Text>
        <Text style={styles.message}>
          Tinh nang goi dang dung WebRTC cho web va Android. Nen tang hien tai
          chua co module WebRTC phu hop de mo phong goi truc tiep.
        </Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quay lai</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 8,
    backgroundColor: "#111827",
    padding: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  message: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
