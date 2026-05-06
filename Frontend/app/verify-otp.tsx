import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import FormInput from "../src/components/register/FormInput";
import AuthShell from "../src/components/auth/AuthShell";

export default function VerifyOTPScreen() {
  const { requestId, phoneNumber } = useLocalSearchParams(); 
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ 6 chữ số");
      return;
    }

    try {
      setSubmitting(true);
      // THAY ĐỊA CHỈ IP BACKEND CỦA BẠN VÀO ĐÂY
      const response = await axios.post("http://192.168.2.139:5000/api/auth/verify-otp", {
        requestId: requestId,
        code: otp,
        phoneNumber: phoneNumber
      });

      if (response.data.success) {
        Alert.alert("Thành công", "Xác thực tài khoản thành công!", [
          { 
            text: "Đăng nhập ngay", 
            onPress: () => {
              // Tuyệt đối không lưu token ở đây để tránh bị nhảy vào Home
              router.replace("/login"); 
            } 
          }
        ]);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Mã xác thực không chính xác");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Xác thực tài khoản"
      subtitle="Vui lòng nhập mã 6 số bạn nghe được từ cuộc gọi của Vonage."
    >
      <FormInput
        label="Mã xác thực"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        icon="shield-checkmark-outline"
        placeholder="Nhập 6 chữ số"
        autoFocus
      />

      <Pressable
        style={[styles.button, otp.length < 6 && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={otp.length < 6 || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Đang xác nhận..." : "Xác nhận mã"}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Chưa nhận được mã?{" "}
        <Text style={styles.link} onPress={() => router.back()}>
          Gửi lại yêu cầu
        </Text>
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  button: { height: 48, borderRadius: 12, backgroundColor: "#1e5eff", alignItems: "center", justifyContent: "center", marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footer: { color: "#c7cbd3", textAlign: "center", marginTop: 24, fontSize: 14 },
  link: { color: "#2d7bff", fontWeight: "700" },
});