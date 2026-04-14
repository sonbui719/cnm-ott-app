import React, { useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import RegisterLayout from "../../src/components/register/RegisterLayout";
import FormInput from "../../src/components/register/FormInput";

const INITIAL_SKILLS = [
  "React",
  "Java",
  "JavaScript",
  "UI/UX Design",
  "Node.js",
  "Python",
];

export default function WorkScreen() {
  const [company, setCompany] = useState("CNTT");
  const [position, setPosition] = useState("KTPM");
  const [department, setDepartment] = useState("Design");
  const [intro, setIntro] = useState("Code");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [facebook, setFacebook] = useState("https://www.facebook.com/trong.hieu.746525/");
  const [github, setGithub] = useState("https://github.com/NguyenTrongHieu0905");
  const [website, setWebsite] = useState("hieu95.click");
  const [agree, setAgree] = useState(true);

  const skillInputRef = useRef<TextInput>(null);

  const normalizedSkill = useMemo(() => skillInput.trim(), [skillInput]);

  const canAddSkill = useMemo(() => {
    return (
      normalizedSkill.length > 0 &&
      !skills.some((item) => item.toLowerCase() === normalizedSkill.toLowerCase()) &&
      skills.length < 10
    );
  }, [normalizedSkill, skills]);

  const canSubmit = useMemo(() => {
    return (
      company.trim().length > 0 &&
      position.trim().length > 0 &&
      department.trim().length > 0 &&
      agree
    );
  }, [company, position, department, agree]);

  const addSkill = () => {
    if (!canAddSkill) return;
    setSkills((prev) => [...prev, normalizedSkill]);
    setSkillInput("");
    skillInputRef.current?.focus();
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ thông tin và đồng ý điều khoản");
      return;
    }

    Alert.alert("Thành công", "Đăng ký thành công");
    router.replace("/register/phone");
  };

  return (
    <RegisterLayout
      stage={2}
      title="Công việc"
      subtitle="Thông tin nghề nghiệp (tùy chọn)"
    >
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormInput
            label="Công ty / Tổ chức"
            value={company}
            onChangeText={setCompany}
            icon="business-outline"
          />
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <FormInput
            label="Chức vụ"
            value={position}
            onChangeText={setPosition}
            icon="briefcase-outline"
          />
        </View>
      </View>

      <FormInput
        label="Phòng ban / Bộ phận"
        value={department}
        onChangeText={setDepartment}
      />

      <FormInput
        label="Giới thiệu bản thân"
        value={intro}
        onChangeText={setIntro}
        multiline
        numberOfLines={5}
      />

      <View style={styles.counterRow}>
        <Text style={styles.sectionLabel}>Kỹ năng (tối đa 10)</Text>
        <Text style={styles.counter}>{skills.length}/10</Text>
      </View>

      <View style={styles.addSkillRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormInput
            ref={skillInputRef}
            value={skillInput}
            onChangeText={setSkillInput}
            placeholder="Thêm kỹ năng..."
          />
        </View>

        <Pressable
          style={[styles.addButton, !canAddSkill && styles.buttonDisabled]}
          onPress={addSkill}
        >
          <Text style={styles.addButtonText}>Thêm</Text>
        </Pressable>
      </View>

      <View style={styles.chipWrap}>
        {skills.map((skill) => (
          <Pressable
            key={skill}
            style={styles.chip}
            onPress={() => removeSkill(skill)}
          >
            <Text style={styles.chipText}>{skill}</Text>
            <Ionicons name="close" size={14} color="#fff" />
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Liên kết mạng xã hội (tùy chọn)</Text>

      <FormInput
        value={facebook}
        onChangeText={setFacebook}
        placeholder="Facebook URL"
      />
      <FormInput
        value={github}
        onChangeText={setGithub}
        placeholder="Github URL"
      />
      <FormInput
        value={website}
        onChangeText={setWebsite}
        placeholder="Website"
      />

      <Pressable
        style={styles.checkboxRow}
        onPress={() => setAgree((prev) => !prev)}
      >
        <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
          {agree ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
        </View>
        <Text style={styles.checkboxText}>
          Tôi đồng ý với <Text style={styles.linkText}>Điều khoản sử dụng</Text> và{" "}
          <Text style={styles.linkText}>Chính sách bảo mật</Text>
        </Text>
      </Pressable>

      <View style={styles.bottomRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color="#fff" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Hoàn tất đăng ký</Text>
        </Pressable>
      </View>

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
  row: {
    flexDirection: "row",
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  counter: {
    color: "#9ca3af",
    fontSize: 13,
  },
  addSkillRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  addButton: {
    height: 48,
    minWidth: 82,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1d",
    borderWidth: 1,
    borderColor: "#3e3e44",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  chipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#5a5a5a",
    backgroundColor: "#111111",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#1e5eff",
    borderColor: "#1e5eff",
  },
  checkboxText: {
    flex: 1,
    color: "#d1d5db",
    lineHeight: 20,
  },
  linkText: {
    color: "#2d7bff",
    fontWeight: "700",
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
  },
  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b4b4b",
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 4,
  },
  submitButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
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