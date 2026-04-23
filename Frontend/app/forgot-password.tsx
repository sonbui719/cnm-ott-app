import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import FormInput from "../src/components/register/FormInput";
import AuthShell from "../src/components/auth/AuthShell";

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSendRequest = async () => {
    const phone = phoneNumber.trim();
    
    // Kiểm tra định dạng số điện thoại cơ bản
    if (!/^0\d{9,10}$/.test(phone) && !/^84\d{9,10}$/.test(phone)) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    try {
      setSubmitting(true);
      // Giả lập gửi mã OTP thành công
      Alert.alert(
        "Thành công",
        "Mã xác thực đã được gửi đến số điện thoại của bạn.",
        [{ text: "Tiếp tục", onPress: () => router.push("/verify-otp") }]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập số điện thoại đã đăng ký để nhận mã khôi phục tài khoản."
    >
      <FormInput
        label="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        icon="call-outline"
        autoFocus
        placeholder="Ví dụ: 09xxxxxxxx"
      />

      <Pressable
        style={[styles.button, !phoneNumber && styles.buttonDisabled]}
        onPress={handleSendRequest}
        disabled={!phoneNumber || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        <Text style={styles.link} onPress={() => router.back()}>
          Quay lại đăng nhập
        </Text>
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
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
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    color: "#2d7bff",
    fontWeight: "700",
  },
});