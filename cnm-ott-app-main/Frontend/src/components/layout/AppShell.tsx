import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { C } from "../../styles/colors";
import { Screen, User } from "../../types";
import BottomNav from "./BottomNav";

type Props = {
  current: Screen;
  title: string;
  subtitle: string;
  currentUser: User;
  onNavigate: (screen: Screen) => void;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export default function AppShell({
  current,
  title,
  subtitle,
  currentUser,
  onNavigate,
  children,
  action,
}: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <View style={styles.topBrand}>
          <View>
            <Text style={styles.brand}>StartupChat</Text>
            <Text style={styles.brandSub}>OTT cho Startup</Text>
          </View>

          <TouchableOpacity onPress={() => onNavigate("statistics")}>
            <Text style={styles.brand}>StartupChat</Text>
            <Text style={styles.brandSub}>OTT cho Startup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {action}
        </View>

        {children}
      </ScrollView>

      <BottomNav current={current} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: C.bg,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  topBrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brand: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
  },
  brandSub: {
    color: C.muted,
    marginTop: 4,
  },
  avatar: {
    fontSize: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  title: {
    color: C.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: C.muted,
    marginTop: 4,
  },
});