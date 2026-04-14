import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RegisterLayout from "../../src/components/register/RegisterLayout";
import FormInput from "../../src/components/register/FormInput";

export default function OtpScreen() {
  const params = useLocalSearchParams();
  const phone = typeof params.phone === "string" ? params.phone : "";

  const [otp, setOtp] = useState("028793");
  const [seconds, setSeconds] = useState(51);
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const otpDigits = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => otp[i] || "");
  }, [otp]);

  const otpValid = useMemo(() => otp.length === 6, [otp]);

  const handleConfirm = () => {
    if (!otpValid) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ 6 số OTP");
      otpInputRef.current?.focus();
      return;
    }

    router.push({
      pathname: "/register/profile",
      params: { phone },
    });
  };

  const handleResend = () => {
    setSeconds(60);
    setOtp("");
    otpInputRef.current?.focus();
  };

  return (
    <RegisterLayout
      stage={1}
      title="Tài khoản & Thông tin cá nhân"
      subtitle="Nhập số điện thoại, mật khẩu và thông tin cơ bản"
    >
      <FormInput
        label="Số điện thoại *"
        value={phone}
        editable={false}
        icon="call-outline"
      />

      <Text style={styles.label}>Nhập mã OTP</Text>

      <Pressable style={styles.otpRow} onPress={() => otpInputRef.current?.focus()}>
        {otpDigits.map((item, index) => (
          <View key={index} style={styles.otpBox}>
            <Text style={styles.otpText}>{item}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={otpInputRef}
        value={otp}
        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        style={styles.hiddenInput}
      />

      {seconds > 0 ? (
        <Text style={styles.resendText}>Gửi lại mã sau {seconds}s</Text>
      ) : (
        <Pressable onPress={handleResend}>
          <Text style={styles.resendLink}>Gửi lại mã OTP</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.button, !otpValid && styles.buttonDisabled]}
        onPress={handleConfirm}
      >
        <Text style={styles.buttonText}>Xác nhận OTP</Text>
      </Pressable>

      <Text style={styles.footer}>
  Đã có tài khoản?{" "}
  <Text style={styles.link} onPress={() => router.push("/login")}>
    Đăng nhập
  </Text>
</Text>
    </RegisterLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 6,
  },
  otpBox: {
    width: 38,
    height: 46,
    borderWidth: 1,
    borderColor: "#4a4a4a",
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    borderRadius: 8,
  },
  otpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },
  resendText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
  },
  resendLink: {
    textAlign: "center",
    color: "#2d7bff",
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
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