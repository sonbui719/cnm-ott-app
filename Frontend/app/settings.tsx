import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type SettingTab = "profile" | "settings" | "security";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingTab>("profile");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState("Phạm Quốc Khách");
  const [email, setEmail] = useState("client1@gmail.com");
  const [phone, setPhone] = useState("0945678901");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [address, setAddress] = useState("123 Nguyễn Văn Bảo, Gò Vấp, TPHCM");
  const [birthday, setBirthday] = useState("15/05/1990");
  const [bio, setBio] = useState(
    "Khách hàng tại FinChat. Quan tâm đến đầu tư tài chính."
  );

  const [pushNotification, setPushNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [soundNotification, setSoundNotification] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [languageIndex, setLanguageIndex] = useState(0);

  const languages = ["Tiếng Việt", "English"];

  const currentLanguage = useMemo(() => {
    return languages[languageIndex];
  }, [languageIndex]);

  const renderTabContent = () => {
    if (activeTab === "profile") {
      return (
        <View style={styles.contentCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              <View style={styles.bigAvatar}>
                <Text style={styles.bigAvatarText}>P</Text>
              </View>

              <Pressable style={styles.cameraBtn}>
                <Ionicons name="camera-outline" size={14} color="#fff" />
              </Pressable>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileRole}>Khách hàng</Text>

              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Đang hoạt động</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            <Pressable
              style={styles.outlineButton}
              onPress={() => setIsEditing((prev) => !prev)}
            >
              <Text style={styles.outlineButtonText}>
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

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <InputRow
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                editable={isEditing}
              />
            </View>

            <View style={styles.col}>
              <InputRow
                label="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                icon="call-outline"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <InputRow
                label="Phòng ban"
                value={department}
                onChangeText={setDepartment}
                icon="grid-outline"
                editable={isEditing}
              />
            </View>

            <View style={styles.col}>
              <InputRow
                label="Chức vụ"
                value={position}
                onChangeText={setPosition}
                icon="briefcase-outline"
                editable={isEditing}
              />
            </View>
          </View>

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
    }

    if (activeTab === "settings") {
      return (
        <View style={styles.contentCard}>
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
            subtitle="Phát âm thanh khi có tin nhắn mới"
            value={soundNotification}
            onValueChange={setSoundNotification}
          />

          <View style={styles.divider} />

          <SectionTitle icon="moon-outline" title="Giao diện" />

          <ToggleRow
            title="Chế độ tối"
            subtitle="Sử dụng giao diện tối"
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
    }

    return (
      <View style={styles.contentCard}>
        <SectionTitle icon="lock-closed-outline" title="Mật khẩu" />

        <Pressable style={styles.outlineButtonSmall}>
          <Text style={styles.outlineButtonText}>Đổi mật khẩu</Text>
        </Pressable>

        <View style={styles.divider} />

        <SectionTitle icon="shield-checkmark-outline" title="Xác thực 2 bước" />

        <ToggleRow
          title="Bật xác thực 2 bước"
          subtitle="Thêm lớp bảo mật cho tài khoản"
          value={twoFactor}
          onValueChange={setTwoFactor}
        />

        <View style={styles.divider} />

        <SectionTitle icon="log-out-outline" title="Đăng xuất" danger />

        <Pressable style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Đăng xuất khỏi tài khoản</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <View style={styles.brandBox}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color="#5da2ff"
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>StartupChat</Text>
              <Text style={styles.brandSub}>OTT cho Startup</Text>
            </View>
          </View>

          <View style={styles.menuList}>
            <Pressable style={styles.menuItem} onPress={() => router.push("/messages")}>
              <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Tin nhắn</Text>
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>4</Text>
              </View>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="people-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Nhóm</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="checkbox-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Công việc</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="sparkles-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Trợ lý AI</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="bar-chart-outline" size={20} color="#9ca3af" />
              <Text style={styles.menuText}>Thống kê</Text>
            </Pressable>
          </View>

          <View style={styles.bottomUserWrap}>
            {showMenu ? (
              <View style={styles.popover}>
                <Pressable
                  style={styles.popoverItem}
                  onPress={() => {
                    setActiveTab("profile");
                    setShowMenu(false);
                  }}
                >
                  <Text style={styles.popoverText}>Cài đặt tài khoản</Text>
                </Pressable>

                <Pressable style={styles.popoverItem}>
                  <Ionicons name="log-out-outline" size={16} color="#ef6b6b" />
                  <Text style={styles.popoverDanger}>Đăng xuất</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              style={styles.userBox}
              onPress={() => setShowMenu((prev) => !prev)}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>P</Text>
              </View>

              <View>
                <Text style={styles.userName}>Phạm Quốc Khách</Text>
                <Text style={styles.userPhone}>0945678901</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.pageHeader}>
            <Pressable style={styles.backIcon} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>Cài đặt tài khoản</Text>
          </View>

          <View style={styles.tabsRow}>
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
          </View>

          <ScrollView
            style={styles.contentWrap}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>
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
  danger = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons
        name={icon}
        size={18}
        color={danger ? "#ef6b6b" : "#ffffff"}
      />
      <Text style={[styles.sectionTitleText, danger && { color: "#ef6b6b" }]}>
        {title}
      </Text>
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
      <View style={{ flex: 1 }}>
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
            icon ? { paddingLeft: 38 } : { paddingLeft: 12 },
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
    flexDirection: "row",
    backgroundColor: "#050505",
  },
  sidebar: {
    width: 240,
    borderRightWidth: 1,
    borderRightColor: "#3f3a27",
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    justifyContent: "space-between",
    backgroundColor: "#111214",
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#3f3a27",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#155eef",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  brandSub: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  menuList: {
    flex: 1,
    marginTop: 18,
  },
  menuItem: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  menuText: {
    color: "#d1d5db",
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  menuBadge: {
    marginLeft: "auto",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  bottomUserWrap: {
    position: "relative",
  },
  popover: {
    position: "absolute",
    bottom: 70,
    left: 0,
    width: 210,
    borderRadius: 14,
    backgroundColor: "#141517",
    borderWidth: 1,
    borderColor: "#5b5134",
    paddingVertical: 8,
    zIndex: 5,
  },
  popoverItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  popoverText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  popoverDanger: {
    color: "#ef6b6b",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
  userBox: {
    borderTopWidth: 1,
    borderTopColor: "#3f3a27",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6b3d17",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  userName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  userPhone: {
    color: "#8f96a3",
    fontSize: 13,
    marginTop: 2,
  },
  main: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  backIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: "#5b5134",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0b",
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
  contentWrap: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  contentCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingTop: 6,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatarWrap: {
    width: 86,
    height: 86,
    marginRight: 16,
    position: "relative",
  },
  bigAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#153566",
    alignItems: "center",
    justifyContent: "center",
  },
  bigAvatarText: {
    color: "#9fc2ff",
    fontSize: 34,
    fontWeight: "700",
  },
  cameraBtn: {
    position: "absolute",
    right: 0,
    bottom: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#111214",
  },
  profileName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  profileRole: {
    color: "#9ca3af",
    fontSize: 14,
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
    color: "#86efac",
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#24262b",
    marginVertical: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  outlineButton: {
    minWidth: 86,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5b5134",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  outlineButtonSmall: {
    minWidth: 120,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5b5134",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  outlineButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
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
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#37322a",
    backgroundColor: "#0f1012",
    color: "#ffffff",
    fontSize: 14,
    paddingRight: 12,
  },
  inputReadonly: {
    color: "#cbd5e1",
  },
  textAreaWrap: {
    alignItems: "flex-start",
  },
  textArea: {
    minHeight: 74,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  toggleTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleSubtitle: {
    color: "#8f96a3",
    fontSize: 13,
    marginTop: 3,
  },
  selectBox: {
    width: 140,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#37322a",
    backgroundColor: "#0f1012",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: "#ffffff",
    fontSize: 14,
  },
  logoutButton: {
    minWidth: 170,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7a3e3e",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    color: "#ef6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
});