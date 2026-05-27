import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FormInput from "../../src/components/register/FormInput";
import RegisterLayout from "../../src/components/register/RegisterLayout";
import { ApiError, sendOtp, verifyOtp } from "../../src/services/auth";
import { setRegisterDraft } from "../../src/store/registerDraft";

export default function OtpScreen() {
  const params = useLocalSearchParams();
  const phone = typeof params.phone === "string" ? params.phone : "";

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorText, setErrorText] = useState("");

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

  const handleConfirm = async () => {
    setErrorText("");

    if (!otpValid) {
      setErrorText("Vui lòng nhập đủ 6 số OTP");
      otpInputRef.current?.focus();
      return;
    }

    try {
      setSubmitting(true);
      const response = await verifyOtp(phone, otp);

      setRegisterDraft({ phone: response.phone });

      router.push({
        pathname: "/register/profile",
        params: { phone: response.phone },
      });
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Xác minh OTP thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setErrorText("");

    try {
      setResending(true);
      const response = await sendOtp(phone);

      setRegisterDraft({ phone: response.phone });
      setSeconds(60);
      setOtp("");
      otpInputRef.current?.focus();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSeconds(60);
        setOtp("");
        otpInputRef.current?.focus();
        return;
      }

      setErrorText(
        error instanceof Error ? error.message : "Gửi lại OTP thất bại"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <RegisterLayout
      stage={1}
      title="Xác nhận OTP"
      subtitle="Nhập mã OTP gồm 6 số vừa được gửi đến điện thoại của bạn"
    >
      <FormInput
        label="Số điện thoại *"
        value={phone}
        editable={false}
        icon="call-outline"
      />

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
        onChangeText={(text) => {
          setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
          if (errorText) setErrorText("");
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        style={styles.hiddenInput}
      />

      {errorText ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      {seconds > 0 ? (
        <Text style={styles.resendText}>Gửi lại mã sau {seconds}s</Text>
      ) : (
        <Pressable onPress={handleResend} disabled={resending}>
          <Text style={styles.resendLink}>
            {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.button, (!otpValid || submitting) && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={!otpValid || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Đang xác minh..." : "Xác nhận OTP"}
        </Text>
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
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 6,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
  },
  resendText: {
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 14,
    marginTop: 6,
  },
  resendLink: {
    color: "#2d7bff",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 14,
    marginTop: 6,
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