import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../src/store/authStore";

type SettingTab = "profile" | "settings" | "security";

export default function SettingsScreen() {
  const session = getAuthSession();
  const sessionUser = session?.user;

  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState(sessionUser?.fullName || "Người dùng");
  const [email, setEmail] = useState(sessionUser?.email || "");
  const [phone, setPhone] = useState(sessionUser?.phone || "");
  const [department, setDepartment] = useState(sessionUser?.department || "");
  const [position, setPosition] = useState(sessionUser?.position || "");
  const [address, setAddress] = useState(sessionUser?.address || "");
  const [birthday, setBirthday] = useState(sessionUser?.birthday || "");
  const [bio, setBio] = useState(sessionUser?.intro || "");

  const [pushNotification, setPushNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(true);
  const [soundNotification, setSoundNotification] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [languageIndex, setLanguageIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const user = getAuthSession()?.user;
      if (!user) return;

      setFullName(user.fullName || "Người dùng");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setPosition(user.position || "");
      setAddress(user.address || "");
      setBirthday(user.birthday || "");
      setBio(user.intro || "");
    }, [])
  );

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const handleSaveProfile = () => {
    if (!session) {
      Alert.alert("Lỗi", "Không tìm thấy phiên đăng nhập");
      return;
    }

    const nextUser = {
      ...session.user,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      position: position.trim(),
      address: address.trim(),
      birthday: birthday.trim(),
      intro: bio.trim(),
    };

    setAuthSession({
      token: session.token,
      user: nextUser,
    });

    setIsEditing(false);
    Alert.alert("Thành công", "Đã cập nhật thông tin hồ sơ");
  };

  const languages = ["Tiếng Việt", "English"];

  const currentLanguage = useMemo(() => {
    return languages[languageIndex];
  }, [languageIndex]);

  const renderProfileTab = () => {
    return (
      <View style={styles.card}>
        <View style={styles.profileTop}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{fullName?.[0] || "U"}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{fullName || "Người dùng"}</Text>
            <Text style={styles.profileSub}>{email || "---"}</Text>

            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Tài khoản đang hoạt động</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <Pressable
            style={styles.actionButton}
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Text style={styles.actionButtonText}>
              {isEditing ? "Lưu" : "Chỉnh sửa"}
            </Text>
          </Pressable>
        </View>

        <InputRow
          label="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
          editable={isEditing}
        />

        <InputRow
          label="Email"
          value={email}
          onChangeText={setEmail}
          icon="mail-outline"
          editable={false}
        />

        <InputRow
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          icon="call-outline"
          editable={isEditing}
        />

        <InputRow
          label="Phòng ban"
          value={department}
          onChangeText={setDepartment}
          icon="grid-outline"
          editable={isEditing}
        />

        <InputRow
          label="Chức vụ"
          value={position}
          onChangeText={setPosition}
          icon="briefcase-outline"
          editable={isEditing}
        />

        <InputRow
          label="Địa chỉ"
          value={address}
          onChangeText={setAddress}
          icon="location-outline"
          editable={isEditing}
        />

        <InputRow
          label="Ngày sinh"
          value={birthday}
          onChangeText={setBirthday}
          icon="calendar-outline"
          editable={isEditing}
        />

        <InputRow
          label="Giới thiệu bản thân"
          value={bio}
          onChangeText={setBio}
          editable={isEditing}
          multiline
        />
      </View>
    );
  };

  const renderSettingTab = () => {
    return (
      <View style={styles.card}>
        <SectionTitle icon="notifications-outline" title="Thông báo" />
        <ToggleRow
          title="Thông báo đẩy"
          subtitle="Nhận thông báo khi có tin nhắn mới"
          value={pushNotification}
          onValueChange={setPushNotification}
        />
        <ToggleRow
          title="Thông báo qua email"
          subtitle="Nhận email khi có hoạt động quan trọng"
          value={emailNotification}
          onValueChange={setEmailNotification}
        />
        <ToggleRow
          title="Âm thanh"
          subtitle="Phát âm khi có tin nhắn mới"
          value={soundNotification}
          onValueChange={setSoundNotification}
        />

        <View style={styles.divider} />

        <SectionTitle icon="moon-outline" title="Giao diện" />
        <ToggleRow
          title="Chế độ tối"
          subtitle="Phù hợp khi dùng điện thoại ban đêm"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <View style={styles.divider} />

        <SectionTitle icon="language-outline" title="Ngôn ngữ" />
        <Pressable
          style={styles.selectBox}
          onPress={() => setLanguageIndex((prev) => (prev + 1) % languages.length)}
        >
          <Text style={styles.selectText}>{currentLanguage}</Text>
          <Ionicons name="chevron-down-outline" size={16} color="#9ca3af" />
        </Pressable>
      </View>
    );
  };

  const renderSecurityTab = () => {
    return (
      <View style={styles.card}>
        <SectionTitle icon="shield-checkmark-outline" title="Bảo mật" />
        <ToggleRow
          title="Xác thực 2 bước"
          subtitle="Tăng độ an toàn cho tài khoản"
          value={twoFactor}
          onValueChange={setTwoFactor}
        />

        <Pressable
          style={styles.passwordButton}
          onPress={() => Alert.alert("Thông báo", "Chức năng đổi mật khẩu sẽ làm sau")}
        >
          <Ionicons name="lock-closed-outline" size={16} color="#ffffff" />
          <Text style={styles.passwordButtonText}>Đổi mật khẩu</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#ffffff" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.pageHeader}>
            <Pressable style={styles.headerIcon} onPress={() => router.push("/messages")}>
              <Ionicons name="arrow-back" size={18} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>Hồ sơ & cài đặt</Text>

            <View style={styles.headerIcon} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsWrap}
            style={styles.tabsScroll}
          >
            <TabButton
              title="Hồ sơ"
              active={activeTab === "profile"}
              onPress={() => setActiveTab("profile")}
            />
            <TabButton
              title="Cài đặt"
              active={activeTab === "settings"}
              onPress={() => setActiveTab("settings")}
            />
            <TabButton
              title="Bảo mật"
              active={activeTab === "security"}
              onPress={() => setActiveTab("security")}
            />
          </ScrollView>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "settings" && renderSettingTab()}
            {activeTab === "security" && renderSecurityTab()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
        {title}
      </Text>
    </Pressable>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color="#ffffff" />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? "#ffffff" : "#cbd5e1"}
        trackColor={{ false: "#23262d", true: "#1e5eff" }}
      />
    </View>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  icon,
  editable = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  editable?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={[styles.inputWrap, multiline && styles.textAreaWrap]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color="#8f96a3"
            style={styles.inputIcon}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline={multiline}
          style={[
            styles.input,
            icon ? { paddingLeft: 40 } : { paddingLeft: 12 },
            multiline && styles.textArea,
            !editable && styles.inputReadonly,
          ]}
          placeholderTextColor="#6b7280"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050505",
  },
  container: {
    flex: 1,
    backgroundColor: "#050505",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  tabsScroll: {
    maxHeight: 50,
    marginBottom: 10,
  },
  tabsWrap: {
    paddingRight: 12,
  },
  tabBtn: {
    minWidth: 100,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5b5134",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0b",
    paddingHorizontal: 16,
    marginRight: 10,
  },
  tabBtnActive: {
    backgroundColor: "#111214",
  },
  tabBtnText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: "#ffffff",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    borderRadius: 18,
    padding: 16,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  bigAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#153566",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bigAvatarText: {
    color: "#9fc2ff",
    fontSize: 30,
    fontWeight: "700",
  },
  profileName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  profileSub: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  statusText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  actionButton: {
    minWidth: 86,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  textAreaWrap: {
    minHeight: 108,
    alignItems: "flex-start",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 2,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#414141",
    backgroundColor: "#161b26",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 14,
    paddingRight: 12,
  },
  textArea: {
    minHeight: 108,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  inputReadonly: {
    opacity: 0.72,
  },
  toggleRow: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: "#0d0f12",
    borderWidth: 1,
    borderColor: "#262a31",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  toggleSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },
  selectBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#414141",
    backgroundColor: "#161b26",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  passwordButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#1a1c20",
    borderWidth: 1,
    borderColor: "#3f3a27",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 4,
  },
  passwordButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  logoutButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 4,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#292c31",
    marginVertical: 14,
  },
});