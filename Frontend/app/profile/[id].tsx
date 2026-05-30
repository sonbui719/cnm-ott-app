import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { API_BASE_URL } from "../../src/config/api";
import { getAuthSession } from "../../src/store/authStore";

type PublicUser = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  position?: string;
  address?: string;
  birthday?: string;
  intro?: string;
  company?: string;
  city?: string;
  country?: string;
};

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const session = getAuthSession();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        });

        if (!res.ok) return;
        setUser(await res.json());
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, session?.token]);

  const fullName = user?.fullName || "Người dùng";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#1e5eff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{fullName[0] || "U"}</Text>
              )}
            </View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.sub}>{user?.email || user?.phone || "---"}</Text>
          </View>

          <View style={styles.section}>
            <InfoRow icon="call-outline" label="Số điện thoại" value={user?.phone} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <InfoRow icon="briefcase-outline" label="Chức vụ" value={user?.position} />
            <InfoRow icon="business-outline" label="Phòng ban" value={user?.department} />
            <InfoRow icon="location-outline" label="Địa chỉ" value={user?.address} />
            <InfoRow icon="calendar-outline" label="Ngày sinh" value={user?.birthday} />
            <InfoRow icon="information-circle-outline" label="Giới thiệu" value={user?.intro} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#60a5fa" />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value?.trim() || "---"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050505",
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#0a0a0a",
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 18,
  },
  profileTop: {
    alignItems: "center",
    paddingVertical: 22,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 14,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },
  name: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
  },
  sub: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    paddingTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 21,
  },
});
