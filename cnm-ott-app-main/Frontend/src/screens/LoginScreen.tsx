import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@findchat.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);

  const handleGitHubLogin = () => {
    const serverIp = "192.168.1.28";
    const authUrl = `http://${serverIp}:3000/auth/github`;

    console.log("Đang gọi tới server:", authUrl);
    Linking.openURL(authUrl).catch((err) =>
      console.error("Lỗi khi mở trình duyệt:", err)
    );
  };

  const fillDemoAccount = () => {
    setEmail("admin@findchat.com");
    setPassword("123456");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#05070d" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={28}
              color="#fff"
            />
          </View>

          <Text style={styles.title}>FindChat</Text>
          <Text style={styles.subtitle}>OTT cho FindChat</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng nhập</Text>
          <Text style={styles.cardDesc}>
            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
          </Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <AntDesign name="google" size={18} color="#fff" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={handleGitHubLogin}
            >
              <AntDesign name="github" size={18} color="#fff" />
              <Text style={styles.socialText}>GitHub</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={18} color="#7b8190" />
            <TextInput
              style={styles.input}
              placeholder="name@company.com"
              placeholderTextColor="#7b8190"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.passwordLabelRow}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="lock" size={18} color="#7b8190" />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#7b8190"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={18}
                color="#7b8190"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.demoBox}
            activeOpacity={0.85}
            onPress={fillDemoAccount}
          >
            <Text style={styles.demoTitle}>Tài khoản demo (click để điền)</Text>
            <Text style={styles.demoInfo}>admin@findchat.com / 123456</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} activeOpacity={0.85}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/register/phone")}
            >
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <Text style={styles.footerLink}>Điều khoản sử dụng</Text> và{" "}
          <Text style={styles.footerLink}>Chính sách bảo mật</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05070d",
    paddingTop: Platform.OS === "android" ? 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#05070d",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#4f7cff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#4f7cff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#8f97a6",
    fontSize: 14,
  },
  // ... (phần styles còn lại giữ nguyên như cũ)
  card: {
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "#151c2f",
    borderRadius: 18,
    padding: 18,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDesc: {
    color: "#8f97a6",
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    height: 46,
    backgroundColor: "#0d1323",
    borderWidth: 1,
    borderColor: "#1a2237",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1e2538",
  },
  dividerText: {
    color: "#6f7788",
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  forgotText: {
    color: "#5f86ff",
    fontSize: 13,
    fontWeight: "600",
  },
  inputWrapper: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#0d1323",
    borderWidth: 1,
    borderColor: "#1a2237",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    marginLeft: 10,
  },
  demoBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#2d4eb8",
    borderStyle: "dashed",
    backgroundColor: "#0f1730",
    borderRadius: 12,
    padding: 12,
  },
  demoTitle: {
    color: "#6f95ff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  demoInfo: {
    color: "#d4dbff",
    fontSize: 13,
  },
  loginButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#5f86ff",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    color: "#8f97a6",
    fontSize: 14,
  },
  registerLink: {
    color: "#5f86ff",
    fontSize: 14,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 18,
    textAlign: "center",
    color: "#6f7788",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  footerLink: {
    color: "#9fb6ff",
  },
});