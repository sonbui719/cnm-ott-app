import React, { useEffect, useMemo, useRef, useState } from "react";
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

type LoginStep = "login" | "otp";

export default function LoginScreen() {
  const [step, setStep] = useState<LoginStep>("login");

  const [phone, setPhone] = useState("0976410755");
  const [password, setPassword] = useState("******");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("564789");
  const [seconds, setSeconds] = useState(35);

  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);

  const isPhoneValid = useMemo(() => {
    const cleaned = phone.replace(/\s/g, "");
    return /^0\d{9,10}$/.test(cleaned);
  }, [phone]);

  const canLogin = useMemo(() => {
    return isPhoneValid && password.trim().length >= 6;
  }, [isPhoneValid, password]);

  const otpDigits = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => otp[i] || "");
  }, [otp]);

  const isOtpValid = useMemo(() => otp.length === 6, [otp]);

  useEffect(() => {
    if (step !== "otp") return;
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, seconds]);

  const fillDemo = () => {
    setPhone("0912345678");
    setPassword("Admin123");
  };

  const handleLogin = () => {
    if (!isPhoneValid) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại hợp lệ");
      phoneRef.current?.focus();
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Thông báo", "Mật khẩu phải có ít nhất 6 ký tự");
      passwordRef.current?.focus();
      return;
    }

    setOtp("");
    setSeconds(60);
    setStep("otp");

    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 100);
  };

  const handleConfirmOtp = () => {
    if (!isOtpValid) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ 6 số OTP");
      otpInputRef.current?.focus();
      return;
    }

    Alert.alert("Thành công", "Đăng nhập thành công");
  };

  const handleResend = () => {
    setOtp("");
    setSeconds(60);
    otpInputRef.current?.focus();
  };

  const handleBackToLogin = () => {
    setStep("login");
    setOtp("");
    setSeconds(35);
  };

  const renderLoginForm = () => (
    <>
      <FormInput
        ref={phoneRef}
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        icon="call-outline"
        autoFocus
      />

      <View style={styles.passwordHeader}>
        <Text style={styles.label}>Mật khẩu</Text>
        <Pressable>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </Pressable>
      </View>

      <FormInput
        ref={passwordRef}
        value={password}
        onChangeText={setPassword}
        icon="lock-closed-outline"
        secureTextEntry={!showPassword}
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
        <Text style={styles.demoTitle}>Tài khoản demo (click để điền)</Text>
        <Text style={styles.demoValue}>0912345678 / Admin123</Text>
      </Pressable>

      <Pressable
        style={[styles.button, !canLogin && styles.buttonDisabled]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </Pressable>

      <Text style={styles.footer}>
        Chưa có tài khoản?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/register/phone")}
        >
          Đăng ký ngay
        </Text>
      </Text>
    </>
  );

  const renderOtpForm = () => (
    <>
      <Text style={styles.otpSubtitle}>
        Mã xác thực đã được gửi đến số điện thoại{" "}
        <Text style={styles.phoneHighlight}>{phone}</Text>
      </Text>

      <Text style={styles.label}>Nhập mã OTP</Text>

      <Pressable
        style={styles.otpRow}
        onPress={() => otpInputRef.current?.focus()}
      >
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
        style={[styles.button, !isOtpValid && styles.buttonDisabled]}
        onPress={handleConfirmOtp}
      >
        <Text style={styles.buttonText}>Xác nhận đăng nhập</Text>
      </Pressable>

      <Pressable onPress={handleBackToLogin}>
        <Text style={styles.backText}>Quay lại</Text>
      </Pressable>

      <Text style={styles.footer}>
        Chưa có tài khoản?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/register/phone")}
        >
          Đăng ký ngay
        </Text>
      </Text>
    </>
  );

  return (
    <AuthShell
      title={step === "login" ? "Đăng nhập" : "Xác thực OTP"}
      subtitle={
        step === "login"
          ? "Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục."
          : ""
      }
    >
      {step === "login" ? renderLoginForm() : renderOtpForm()}
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
  forgotText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "600",
  },
  demoBox: {
    borderWidth: 1,
    borderColor: "#103a72",
    backgroundColor: "#0c1d35",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginTop: -2,
  },
  demoTitle: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  demoValue: {
    color: "#dbeafe",
    fontSize: 14,
  },
  otpSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  phoneHighlight: {
    color: "#ffffff",
    fontWeight: "700",
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
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  backText: {
    color: "#ffffff",
    textAlign: "center",
    marginTop: 18,
    fontSize: 15,
    fontWeight: "600",
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