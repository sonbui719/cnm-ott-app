import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Conversation } from "../../data/messageData";

type Props = {
  item: Conversation;
  active?: boolean;
  onPress?: () => void;
};

export default function ConversationItem({
  item,
  active = false,
  onPress,
}: Props) {
  return (
    <Pressable
      style={[styles.row, active && styles.rowActive]}
      onPress={onPress}
    >
      <View style={styles.avatarWrap}>
        {item.isBot ? (
          <View style={styles.botAvatar}>
            <View style={styles.dotRow}>
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <View style={styles.dotRow}>
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.avatarText || "U"}</Text>
          </View>
        )}

        {item.unread ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.time && <Text style={styles.time}>{item.time}</Text>}
        </View>

        <Text style={styles.preview} numberOfLines={2}>
          {item.preview}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
  },
  rowActive: {
    backgroundColor: "#0d0f12",
  },
  avatarWrap: {
    width: 54,
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#6b0036",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  botAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#6c3b1f",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  dotRow: {
    flexDirection: "row",
    marginVertical: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff7a1a",
    marginHorizontal: 2,
  },
  badge: {
    position: "absolute",
    right: 2,
    bottom: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  name: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },
  time: {
    color: "#9ca3af",
    fontSize: 12,
  },
  preview: {
    color: "#8f96a3",
    fontSize: 15,
    lineHeight: 20,
  },
});