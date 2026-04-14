import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MessageTab } from "../../data/messageData";

type Props = {
  activeTab: MessageTab;
  onChange: (tab: MessageTab) => void;
};

export default function MessageTabs({ activeTab, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[styles.tab, activeTab === "all" && styles.tabActive]}
        onPress={() => onChange("all")}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={16}
          color={activeTab === "all" ? "#ffffff" : "#9ca3af"}
        />
        <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
          Tất cả
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === "personal" && styles.tabActive]}
        onPress={() => onChange("personal")}
      >
        <Ionicons
          name="chatbubble-outline"
          size={16}
          color={activeTab === "personal" ? "#ffffff" : "#9ca3af"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "personal" && styles.tabTextActive,
          ]}
        >
          Cá nhân
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === "group" && styles.tabActive]}
        onPress={() => onChange("group")}
      >
        <Ionicons
          name="people-outline"
          size={16}
          color={activeTab === "group" ? "#ffffff" : "#9ca3af"}
        />
        <Text style={[styles.tabText, activeTab === "group" && styles.tabTextActive]}>
          Nhóm
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    backgroundColor: "#111214",
    borderRadius: 12,
    padding: 4,
    marginTop: 14,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  tabActive: {
    backgroundColor: "#1a1c20",
  },
  tabText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  tabTextActive: {
    color: "#ffffff",
  },
});