import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBox}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={26}
              color="#4ea1ff"
            />
          </View>

          <Text style={styles.appName}>FinChat</Text>
          <Text style={styles.appSub}>OTT cho Dịch vụ Tài chính</Text>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={{ marginTop: 18 }}>{children}</View>
          </View>

          <Text style={styles.policyText}>
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <Text style={styles.linkText}>Điều khoản sử dụng</Text> và{" "}
            <Text style={styles.linkText}>Chính sách bảo mật</Text>
          </Text>
        </ScrollView>
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
    backgroundColor: "#050505",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#0b1730",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  appName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  appSub: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    width: "100%",
    backgroundColor: "#09090a",
    borderWidth: 1,
    borderColor: "#7b6a3f",
    borderRadius: 22,
    padding: 18,
    marginTop: 28,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  policyText: {
    marginTop: 18,
    textAlign: "center",
    color: "#8f96a3",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  linkText: {
    color: "#cfd5df",
    textDecorationLine: "underline",
  },
});