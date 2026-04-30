import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import FormInput from "../src/components/register/FormInput";
import AuthShell from "../src/components/auth/AuthShell";

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSendRequest = async () => {
    const phone = phoneNumber.trim();
    if (!/^0\d{9,10}$/.test(phone)) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    try {
      setSubmitting(true);
      // THAY ĐỊA CHỈ IP BACKEND CỦA BẠN VÀO ĐÂY
      const response = await axios.post("http://192.168.1.12:5000/api/auth/forgot-password", {
        phoneNumber: phone
      });

      if (response.data.success) {
        Alert.alert("Thành công", "Bạn sẽ nhận được cuộc gọi đọc mã OTP từ Vonage.", [
          { 
            text: "Tiếp tục", 
            onPress: () => router.push({
              pathname: "/verify-otp",
              params: { requestId: response.data.requestId, phoneNumber: phone }
            }) 
          }
        ]);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Lỗi hệ thống hoặc SĐT chưa đăng ký");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập số điện thoại đã đăng ký để nhận mã khôi phục qua cuộc gọi."
    >
      <FormInput
        label="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        icon="call-outline"
        autoFocus
        placeholder="Nhập số điện thoại (VD: 09xxxxxxxx)"
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
          Quay lại Đăng nhập
        </Text>
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  button: { height: 48, borderRadius: 12, backgroundColor: "#1e5eff", alignItems: "center", justifyContent: "center", marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footer: { color: "#c7cbd3", textAlign: "center", marginTop: 20, fontSize: 14 },
  link: { color: "#2d7bff", fontWeight: "700" },
});