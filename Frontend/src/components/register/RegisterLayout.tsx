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
  stage: 1 | 2;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function RegisterLayout({
  stage,
  title,
  subtitle,
  children,
}: Props) {
  const stage1Done = stage === 2;

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

          <View style={styles.progressWrap}>
            <View style={styles.progressItem}>
              <View style={[styles.circle, styles.circleActive]}>
                {stage1Done ? (
                  <Ionicons name="checkmark" size={15} color="#fff" />
                ) : (
                  <Text style={styles.circleText}>1</Text>
                )}
              </View>
              <Text style={styles.progressText}>Tài khoản &{"\n"}Cá nhân</Text>
            </View>

            <View
              style={[
                styles.line,
                stage === 2 && { backgroundColor: "#1e5eff" },
              ]}
            />

            <View style={styles.progressItem}>
              <View
                style={[
                  styles.circle,
                  stage === 2 ? styles.circleActive : styles.circleInactive,
                ]}
              >
                <Text style={styles.circleText}>2</Text>
              </View>
              <Text style={styles.progressText}>Công việc</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={{ marginTop: 18 }}>{children}</View>
          </View>
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
    paddingTop: 22,
    paddingBottom: 40,
    alignItems: "center",
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
  progressWrap: {
    marginTop: 20,
    width: "76%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  progressItem: {
    alignItems: "center",
    width: 84,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: "#1e5eff",
  },
  circleInactive: {
    backgroundColor: "#2a2a2f",
  },
  circleText: {
    color: "#fff",
    fontWeight: "700",
  },
  line: {
    height: 2,
    width: 70,
    backgroundColor: "#2a2a2f",
    marginTop: 14,
  },
  progressText: {
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "#09090a",
    borderWidth: 1,
    borderColor: "#7b6a3f",
    borderRadius: 22,
    padding: 18,
    marginTop: 24,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
});