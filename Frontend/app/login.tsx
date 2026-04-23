import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import FormInput from "../src/components/register/FormInput";
import AuthShell from "../src/components/auth/AuthShell";
import { login } from "../src/services/auth";
import { setAuthSession } from "../src/store/authStore";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const identifierRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isIdentifierValid = useMemo(() => {
    const value = identifier.trim();

    if (!value) return false;
    if (value.includes("@")) return /\S+@\S+\.\S+/.test(value);

    const cleaned = value.replace(/\s/g, "");
    return /^0\d{9,10}$/.test(cleaned) || /^84\d{9,10}$/.test(cleaned);
  }, [identifier]);

  const canLogin = useMemo(() => {
    return isIdentifierValid && password.trim().length >= 6 && !submitting;
  }, [isIdentifierValid, password, submitting]);

  const fillDemo = () => {
    setIdentifier("admin@startup.com");
    setPassword("123456");
  };

  const handleLogin = async () => {
    if (!isIdentifierValid) {
      Alert.alert("Thông báo", "Vui lòng nhập email hoặc số điện thoại hợp lệ");
      identifierRef.current?.focus();
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Thông báo", "Mật khẩu phải có ít nhất 6 ký tự");
      passwordRef.current?.focus();
      return;
    }

    try {
      setSubmitting(true);
      const response = await login(identifier.trim(), password);
      setAuthSession({ token: response.token, user: response.user });
      Alert.alert("Thành công", response.message || "Đăng nhập thành công", [
        {
          text: "OK",
          onPress: () => router.replace("/messages"),
        },
      ]);
    } catch (error) {
      Alert.alert("Đăng nhập thất bại", error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Dùng email hoặc số điện thoại đã đăng ký để truy cập hệ thống."
    >
      <FormInput
        ref={identifierRef}
        label="Email hoặc số điện thoại"
        value={identifier}
        onChangeText={setIdentifier}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        icon="person-outline"
        autoFocus
        placeholder="name@company.com hoặc 09xxxxxxxx"
      />

      <View style={styles.passwordHeader}>
        <Text style={styles.label}>Mật khẩu</Text>
        {/* Thêm nút Quên mật khẩu ở đây để tận dụng justifyContent: "space-between" */}
        <Pressable onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotPasswordLink}>Quên mật khẩu?</Text>
        </Pressable>
      </View>

      <FormInput
        ref={passwordRef}
        value={password}
        onChangeText={setPassword}
        icon="lock-closed-outline"
        secureTextEntry={!showPassword}
        placeholder="Nhập mật khẩu"
        rightElement={
          <Pressable onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={18}
              color="#9ca3af"
            />
          </Pressable>
        }
      />

      <Pressable style={styles.demoBox} onPress={fillDemo}>
        <Text style={styles.demoTitle}>Điền nhanh tài khoản mẫu</Text>
        <Text style={styles.demoValue}>admin@startup.com / 123456</Text>
      </Pressable>

      <Pressable
        style={[styles.button, !canLogin && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={!canLogin}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Chưa có tài khoản?{" "}
        <Text style={styles.link} onPress={() => router.push("/register/phone") }>
          Đăng ký ngay
        </Text>
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: -2,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  forgotPasswordLink: {
    color: "#2d7bff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  demoBox: {
    borderWidth: 1,
    borderColor: "#2d3748",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  demoTitle: {
    color: "#dbeafe",
    fontSize: 14,
    fontWeight: "700",
  },
  demoValue: {
    color: "#93c5fd",
    marginTop: 4,
    fontSize: 13,
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    color: "#c7cbd3",
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
  },
  link: {
    color: "#2d7bff",
    fontWeight: "700",
  },
});