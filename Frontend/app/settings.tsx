import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
<<<<<<< HEAD
import React, { useCallback, useMemo, useState } from "react";
=======
import React, { useCallback, useState } from "react";
>>>>>>> main
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
<<<<<<< HEAD
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
=======
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { API_BASE_URL } from "../src/config/api";
>>>>>>> main
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../src/store/authStore";
<<<<<<< HEAD

type SettingTab = "profile" | "settings" | "security";
=======
import { disconnectSocket } from "../src/services/socket";
>>>>>>> main

export default function SettingsScreen() {
  const session = getAuthSession();
  const sessionUser = session?.user;

<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [isEditing, setIsEditing] = useState(false);

=======
  const [isEditing, setIsEditing] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(sessionUser?.avatar || "");
>>>>>>> main
  const [fullName, setFullName] = useState(sessionUser?.fullName || "Người dùng");
  const [email, setEmail] = useState(sessionUser?.email || "");
  const [phone, setPhone] = useState(sessionUser?.phone || "");
  const [department, setDepartment] = useState(sessionUser?.department || "");
  const [position, setPosition] = useState(sessionUser?.position || "");
  const [address, setAddress] = useState(sessionUser?.address || "");
  const [birthday, setBirthday] = useState(sessionUser?.birthday || "");
  const [bio, setBio] = useState(sessionUser?.intro || "");

<<<<<<< HEAD
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

=======
  useFocusEffect(
    useCallback(() => {
      const user = getAuthSession()?.user;

      if (!user) return;

      setAvatarUrl(user.avatar || "");
>>>>>>> main
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
<<<<<<< HEAD
    clearAuthSession();
    router.replace("/login");
  };

  const handleSaveProfile = () => {
    if (!session) {
      Alert.alert("Lỗi", "Không tìm thấy phiên đăng nhập");
=======
    if (Platform.OS === "web") {
      disconnectSocket();
      clearAuthSession();
      router.replace("/login");
      return;
    }

    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            disconnectSocket();
            clearAuthSession();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    const currentSession = getAuthSession();

    if (!currentSession) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập");
>>>>>>> main
      return;
    }

    const nextUser = {
<<<<<<< HEAD
      ...session.user,
=======
      ...currentSession.user,
      avatar: avatarUrl,
>>>>>>> main
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
<<<<<<< HEAD
      token: session.token,
=======
      token: currentSession.token,
>>>>>>> main
      user: nextUser,
    });

    setIsEditing(false);
    Alert.alert("Thành công", "Đã cập nhật thông tin hồ sơ");
  };

<<<<<<< HEAD
  const languages = ["Tiếng Việt", "English"];

  const currentLanguage = useMemo(() => {
    return languages[languageIndex];
  }, [languageIndex]);
=======
  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAvatarToS3(result.assets[0].uri);
    }
  };

  const uploadAvatarToS3 = async (uri: string) => {
    const currentSession = getAuthSession();

    if (!currentSession) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập");
      return;
    }

    try {
      Alert.alert("Đang tải lên...", "Vui lòng đợi trong giây lát");

      const formData = new FormData();

      formData.append("file", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const uploadRes = await fetch(`${API_BASE_URL}/chat/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      const updateRes = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.token}`,
        },
        body: JSON.stringify({
          avatarUrl: uploadData.url,
        }),
      });

      const updatedUser = await updateRes.json();

      setAvatarUrl(uploadData.url);

      setAuthSession({
        token: currentSession.token,
        user: updatedUser,
      });

      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải ảnh lên hệ thống");
    }
  };
>>>>>>> main

  const renderProfileTab = () => {
    return (
      <View style={styles.card}>
        <View style={styles.profileTop}>
          <View style={styles.bigAvatar}>
<<<<<<< HEAD
            <Text style={styles.bigAvatarText}>{fullName?.[0] || "U"}</Text>
=======
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 74, height: 74, borderRadius: 37 }}
              />
            ) : (
              <Text style={styles.bigAvatarText}>{fullName?.[0] || "U"}</Text>
            )}

            <Pressable style={styles.cameraIcon} onPress={handlePickAvatar}>
              <Ionicons name="camera" size={14} color="#fff" />
            </Pressable>
>>>>>>> main
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
<<<<<<< HEAD
          label="Giới thiệu bản thân"
          value={bio}
          onChangeText={setBio}
          editable={isEditing}
          multiline
=======
          label="Giới thiệu"
          value={bio}
          onChangeText={setBio}
          icon="document-text-outline"
          editable={isEditing}
>>>>>>> main
        />
      </View>
    );
  };

<<<<<<< HEAD
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

=======
>>>>>>> main
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.pageHeader}>
<<<<<<< HEAD
            <Pressable style={styles.headerIcon} onPress={() => router.push("/messages")}>
=======
            <Pressable
              style={styles.headerIcon}
              onPress={() => router.push("/messages")}
            >
>>>>>>> main
              <Ionicons name="arrow-back" size={18} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>Hồ sơ & cài đặt</Text>

            <View style={styles.headerIcon} />
          </View>

          <ScrollView
<<<<<<< HEAD
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
=======
>>>>>>> main
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
<<<<<<< HEAD
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "settings" && renderSettingTab()}
            {activeTab === "security" && renderSecurityTab()}
=======
            {renderProfileTab()}

            <View style={styles.accountCard}>
              <Text style={styles.sectionTitle}>Tài khoản</Text>

              {/* Nút đăng xuất */}
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </Pressable>
            </View>
>>>>>>> main
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

<<<<<<< HEAD
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

=======
>>>>>>> main
function InputRow({
  label,
  value,
  onChangeText,
  icon,
  editable = false,
<<<<<<< HEAD
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  editable?: boolean;
  multiline?: boolean;
}) {
=======
}: any) {
>>>>>>> main
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

<<<<<<< HEAD
      <View style={[styles.inputWrap, multiline && styles.textAreaWrap]}>
        {icon ? (
=======
      <View style={styles.inputWrap}>
        {icon && (
>>>>>>> main
          <Ionicons
            name={icon}
            size={16}
            color="#8f96a3"
            style={styles.inputIcon}
          />
<<<<<<< HEAD
        ) : null}
=======
        )}
>>>>>>> main

        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
<<<<<<< HEAD
          multiline={multiline}
          style={[
            styles.input,
            icon ? { paddingLeft: 40 } : { paddingLeft: 12 },
            multiline && styles.textArea,
=======
          style={[
            styles.input,
            icon ? { paddingLeft: 40 } : { paddingLeft: 12 },
>>>>>>> main
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
<<<<<<< HEAD
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
=======
>>>>>>> main
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
<<<<<<< HEAD
=======
  accountCard: {
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
  },
>>>>>>> main
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
<<<<<<< HEAD
=======
    position: "relative",
>>>>>>> main
  },
  bigAvatarText: {
    color: "#9fc2ff",
    fontSize: 30,
    fontWeight: "700",
  },
<<<<<<< HEAD
=======
  cameraIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#1e5eff",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#111214",
  },
>>>>>>> main
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
<<<<<<< HEAD
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
=======
  logoutButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
>>>>>>> main
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
<<<<<<< HEAD
  textAreaWrap: {
    minHeight: 108,
    alignItems: "flex-start",
  },
=======
>>>>>>> main
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
<<<<<<< HEAD
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
=======
  inputReadonly: {
    opacity: 0.72,
  },
});
>>>>>>> main
