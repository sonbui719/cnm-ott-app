import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import FormInput from "../../src/components/register/FormInput";
import RegisterLayout from "../../src/components/register/RegisterLayout";
import { ApiError, sendOtp } from "../../src/services/auth";
import { setRegisterDraft } from "../../src/store/registerDraft";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const phoneRef = useRef<TextInput>(null);

  const isPhoneValid = useMemo(() => {
    const cleaned = phone.replace(/\s/g, "");
    return /^0\d{9,10}$/.test(cleaned) || /^84\d{9,10}$/.test(cleaned);
  }, [phone]);

  const goToOtpScreen = (targetPhone: string) => {
    setRegisterDraft({ phone: targetPhone });
    router.push({
      pathname: "/register/otp",
      params: { phone: targetPhone },
    });
  };

  const handleSendOtp = async () => {
    setErrorText("");

    if (!isPhoneValid) {
      setErrorText("Vui lòng nhập số điện thoại hợp lệ");
      phoneRef.current?.focus();
      return;
    }

    try {
      setSubmitting(true);
      const response = await sendOtp(phone.trim());
      goToOtpScreen(response.phone);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const targetPhone = error.data?.phone || phone.trim();
        goToOtpScreen(targetPhone);
        return;
      }

      setErrorText(
        error instanceof Error ? error.message : "Gửi OTP thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RegisterLayout
      stage={1}
      title="Xác thực số điện thoại"
      subtitle="Nhập số điện thoại để hệ thống gửi mã OTP xác minh"
    >
      <FormInput
        ref={phoneRef}
        label="Số điện thoại *"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          if (errorText) setErrorText("");
        }}
        keyboardType="phone-pad"
        icon="call-outline"
        autoFocus
        placeholder="09xxxxxxxx"
      />

      {errorText ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <Pressable
        style={[
          styles.button,
          (!isPhoneValid || submitting) && styles.buttonDisabled,
        ]}
        onPress={handleSendOtp}
        disabled={!isPhoneValid || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Đang gửi OTP..." : "Gửi mã OTP"}
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
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
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