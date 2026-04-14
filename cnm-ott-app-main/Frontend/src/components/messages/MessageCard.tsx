import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MessageThread } from "../../types";
import { C } from "../../styles/colors";

export default function MessageCard({ item }: { item: MessageThread }) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.avatar}>{item.avatar}</Text>
        {item.online ? <View style={styles.dot} /> : null}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.lastMessage}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  left: {
    width: 54,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatar: {
    fontSize: 28,
  },
  dot: {
    position: "absolute",
    right: 10,
    bottom: 4,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.bg,
  },
  name: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  message: {
    color: C.muted,
    fontSize: 14,
  },
  right: {
    alignItems: "flex-end",
    gap: 8,
  },
  time: {
    color: C.soft,
    fontSize: 12,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },
});