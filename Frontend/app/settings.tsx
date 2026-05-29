import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { API_BASE_URL } from "../src/config/api";
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../src/store/authStore";
import { disconnectSocket } from "../src/services/socket";

export default function SettingsScreen() {
  const session = getAuthSession();
  const sessionUser = session?.user;

  const [isEditing, setIsEditing] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(sessionUser?.avatar || "");
  const [fullName, setFullName] = useState(sessionUser?.fullName || "Người dùng");
  const [email, setEmail] = useState(sessionUser?.email || "");
  const [phone, setPhone] = useState(sessionUser?.phone || "");
  const [department, setDepartment] = useState(sessionUser?.department || "");
  const [position, setPosition] = useState(sessionUser?.position || "");
  const [address, setAddress] = useState(sessionUser?.address || "");
  const [birthday, setBirthday] = useState(sessionUser?.birthday || "");
  const [bio, setBio] = useState(sessionUser?.intro || "");

  useFocusEffect(
    useCallback(() => {
      const user = getAuthSession()?.user;

      if (!user) return;

      setAvatarUrl(user.avatar || "");
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
      return;
    }

    const nextUser = {
      ...currentSession.user,
      avatar: avatarUrl,
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
      token: currentSession.token,
      user: nextUser,
    });

    setIsEditing(false);
    Alert.alert("Thành công", "Đã cập nhật thông tin hồ sơ");
  };

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

  const renderProfileTab = () => {
    return (
      <View style={styles.card}>
        <View style={styles.profileTop}>
          <View style={styles.bigAvatar}>
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
          label="Giới thiệu"
          value={bio}
          onChangeText={setBio}
          icon="document-text-outline"
          editable={isEditing}
        />
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
            <Pressable
              style={styles.headerIcon}
              onPress={() => router.push("/messages")}
            >
              <Ionicons name="arrow-back" size={18} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>Hồ sơ & cài đặt</Text>

            <View style={styles.headerIcon} />
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {renderProfileTab()}

            <View style={styles.accountCard}>
              <Text style={styles.sectionTitle}>Tài khoản</Text>

              {/* Nút đăng xuất */}
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  icon,
  editable = false,
}: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={styles.inputWrap}>
        {icon && (
          <Ionicons
            name={icon}
            size={16}
            color="#8f96a3"
            style={styles.inputIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          style={[
            styles.input,
            icon ? { paddingLeft: 40 } : { paddingLeft: 12 },
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
  accountCard: {
    backgroundColor: "#111214",
    borderWidth: 1,
    borderColor: "#3f3a27",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
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
    position: "relative",
  },
  bigAvatarText: {
    color: "#9fc2ff",
    fontSize: 30,
    fontWeight: "700",
  },
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
  inputReadonly: {
    opacity: 0.72,
  },
});
