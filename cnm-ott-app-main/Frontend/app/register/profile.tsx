import React, { useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import RegisterLayout from "../../src/components/register/RegisterLayout";
import FormInput from "../../src/components/register/FormInput";

export default function ProfileScreen() {
  const params = useLocalSearchParams();
  const phone = typeof params.phone === "string" ? params.phone : "";

  const [password, setPassword] = useState("Aa123456");
  const [confirmPassword, setConfirmPassword] = useState("Aa123456");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("Nguyễn Trọng Hiếu");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [birthday, setBirthday] = useState("09/05/2004");
  const [address, setAddress] = useState("12 Nguyễn Văn Bảo");
  const [city, setCity] = useState("Hồ Chí Minh");
  const [country, setCountry] = useState("Việt Nam");

  const nameRef = useRef<TextInput>(null);

  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      match: password === confirmPassword && confirmPassword.length > 0,
    };
  }, [password, confirmPassword]);

  const canNext = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      birthday.trim().length > 0 &&
      address.trim().length > 0 &&
      city.trim().length > 0 &&
      country.trim().length > 0 &&
      passwordChecks.minLength &&
      passwordChecks.hasUpper &&
      passwordChecks.hasLower &&
      passwordChecks.hasNumber &&
      passwordChecks.match
    );
  }, [fullName, birthday, address, city, country, passwordChecks]);

  const handleNext = () => {
    if (!canNext) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ và đúng thông tin");
      if (!fullName.trim()) {
        nameRef.current?.focus();
      }
      return;
    }

    router.push("/register/work");
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
        rightElement={<Ionicons name="checkmark" size={18} color="#10b981" />}
      />

      <View style={styles.successBox}>
        <Ionicons name="checkmark" size={16} color="#22c55e" />
        <Text style={styles.successText}>Số điện thoại đã được xác thực</Text>
      </View>

      <FormInput
        label="Mật khẩu *"
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

      <View style={styles.strengthBars}>
        <View
          style={[
            styles.strengthBar,
            { backgroundColor: passwordChecks.minLength ? "#ef4444" : "#2a2a2a" },
          ]}
        />
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor:
                passwordChecks.hasUpper && passwordChecks.hasLower
                  ? "#f59e0b"
                  : "#2a2a2a",
            },
          ]}
        />
        <View
          style={[
            styles.strengthBar,
            { backgroundColor: passwordChecks.hasNumber ? "#22c55e" : "#2a2a2a" },
          ]}
        />
      </View>

      <View style={styles.ruleRow}>
        <View style={styles.ruleCol}>
          <Text
            style={[
              styles.ruleText,
              passwordChecks.minLength && styles.ruleTextOk,
            ]}
          >
            ✓ ít nhất 6 ký tự
          </Text>
          <Text
            style={[
              styles.ruleText,
              passwordChecks.hasLower && styles.ruleTextOk,
            ]}
          >
            ✓ Có chữ thường
          </Text>
        </View>

        <View style={styles.ruleCol}>
          <Text
            style={[
              styles.ruleText,
              passwordChecks.hasUpper && styles.ruleTextOk,
            ]}
          >
            ✓ Có chữ hoa
          </Text>
          <Text
            style={[
              styles.ruleText,
              passwordChecks.hasNumber && styles.ruleTextOk,
            ]}
          >
            ✓ Có số
          </Text>
        </View>
      </View>

      <FormInput
        label="Xác nhận mật khẩu *"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        icon="lock-closed-outline"
        secureTextEntry={!showConfirmPassword}
        rightElement={
          <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={passwordChecks.match ? "#10b981" : "#9ca3af"}
            />
          </Pressable>
        }
      />

      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

      <FormInput
        ref={nameRef}
        label="Họ và tên *"
        value={fullName}
        onChangeText={setFullName}
        icon="person-outline"
      />

      <Text style={styles.fieldLabel}>Giới tính</Text>
      <View style={styles.genderRow}>
        {(["Nam", "Nữ", "Khác"] as const).map((item) => {
          const active = gender === item;
          return (
            <Pressable
              key={item}
              onPress={() => setGender(item)}
              style={[styles.genderBtn, active && styles.genderBtnActive]}
            >
              <Text style={[styles.genderText, active && styles.genderTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FormInput
        label="Ngày sinh"
        value={birthday}
        onChangeText={setBirthday}
        icon="calendar-outline"
      />

      <FormInput
        label="Địa chỉ"
        value={address}
        onChangeText={setAddress}
        icon="location-outline"
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormInput label="Thành phố" value={city} onChangeText={setCity} />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <FormInput label="Quốc gia" value={country} onChangeText={setCountry} />
        </View>
      </View>

      <Pressable
        style={[styles.button, !canNext && styles.buttonDisabled]}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>Tiếp theo</Text>
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
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.14)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.45)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  successText: {
    color: "#4ade80",
    marginLeft: 8,
    fontWeight: "600",
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
    marginTop: -4,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  ruleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  ruleCol: {
    flex: 1,
  },
  ruleText: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 4,
  },
  ruleTextOk: {
    color: "#22c55e",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#414141",
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  genderBtnActive: {
    backgroundColor: "#1e5eff",
    borderColor: "#1e5eff",
  },
  genderText: {
    color: "#d1d5db",
    fontWeight: "600",
  },
  genderTextActive: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
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