import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { C } from "../../styles/colors";
import { Screen } from "../../types";

type Props = {
  current: Screen;
  onNavigate: (screen: Screen) => void;
};

export default function BottomNav({ current, onNavigate }: Props) {
  const items = [
    { key: "messages", label: "Tin nhắn", icon: <Ionicons name="chatbubble-outline" size={20} color={current === "messages" ? C.primary : C.muted} /> },
    { key: "groups", label: "Nhóm", icon: <Ionicons name="people-outline" size={20} color={current === "groups" ? C.primary : C.muted} /> },
    { key: "tasks", label: "Công việc", icon: <Feather name="check-square" size={20} color={current === "tasks" ? C.primary : C.muted} /> },
    { key: "ai", label: "Trợ lý", icon: <MaterialCommunityIcons name="robot-outline" size={20} color={current === "ai" ? C.primary : C.muted} /> },
    { key: "statistics", label: "Thống kê", icon: <Ionicons name="stats-chart-outline" size={20} color={current === "statistics" ? C.primary : C.muted} /> },
  ] as const;

  return (
    <View style={styles.nav}>
      {items.map((item) => (
        <TouchableOpacity key={item.key} style={styles.item} onPress={() => onNavigate(item.key)}>
          {item.icon}
          <Text style={[styles.label, current === item.key && styles.active]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    backgroundColor: C.panel,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 10,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  label: {
    color: C.muted,
    fontSize: 11,
  },
  active: {
    color: C.primary,
    fontWeight: "700",
  },
});