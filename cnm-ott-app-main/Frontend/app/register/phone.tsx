import React, { useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { router } from "expo-router";
import RegisterLayout from "../../src/components/register/RegisterLayout";
import FormInput from "../../src/components/register/FormInput";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("0976410755");
  const phoneRef = useRef<TextInput>(null);

  const isPhoneValid = useMemo(() => {
    const cleaned = phone.replace(/\s/g, "");
    return /^0\d{9,10}$/.test(cleaned);
  }, [phone]);

  const handleSendOtp = () => {
    if (!isPhoneValid) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại hợp lệ");
      phoneRef.current?.focus();
      return;
    }

    router.push({
      pathname: "/register/otp",
      params: { phone },
    });
  };

  return (
    <RegisterLayout
      stage={1}
      title="Tài khoản & Thông tin cá nhân"
      subtitle="Nhập số điện thoại, mật khẩu và thông tin cơ bản"
    >
      <FormInput
        ref={phoneRef}
        label="Số điện thoại *"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        icon="call-outline"
        autoFocus
      />

      <Pressable
        style={[styles.button, !isPhoneValid && styles.buttonDisabled]}
        onPress={handleSendOtp}
      >
        <Text style={styles.buttonText}>Gửi mã OTP</Text>
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