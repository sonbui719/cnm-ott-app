<<<<<<< HEAD
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
=======
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Conversation } from "../../data/messageData";

const DELETE_ACTION_WIDTH = 88;

type Props = {
  item: Conversation;
  onPress: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
};

export default function ConversationItem({ item, onPress, onDelete, onLongPress }: Props) {
  const swipeableRef = useRef<Swipeable | null>(null);
  const isSwipeOpen = useRef(false);
  const isSwiping = useRef(false);
  const [webOffset, setWebOffset] = useState(0);
  const webStartX = useRef(0);
  const webStartY = useRef(0);
  const webStartOffset = useRef(0);
  const webDidDrag = useRef(false);

  const handleDelete = () => {
    isSwipeOpen.current = false;
    isSwiping.current = false;
    setWebOffset(0);
    swipeableRef.current?.close();
    onDelete?.();
  };

  const handlePress = () => {
    if (isSwiping.current || isSwipeOpen.current) {
      isSwiping.current = false;
      swipeableRef.current?.close();
      return;
    }

    onPress();
  };

  const renderRightActions = () => (
    <Pressable style={styles.deleteButton} onPress={handleDelete}>
      <Ionicons name="trash" size={22} color="#fff" />
      <Text style={styles.deleteText}>Xoa</Text>
    </Pressable>
  );

  const closeWebActions = () => {
    isSwipeOpen.current = false;
    setWebOffset(0);
  };

  const openWebActions = () => {
    isSwipeOpen.current = true;
    setWebOffset(-DELETE_ACTION_WIDTH);
  };

  const handleWebPress = () => {
    if (webDidDrag.current) {
      webDidDrag.current = false;
      return;
    }

    if (isSwipeOpen.current) {
      closeWebActions();
      return;
    }

    onPress();
  };

  const handleWebMouseDown = (event: any) => {
    if (event?.nativeEvent?.button !== 0) return;

    webStartX.current = event.nativeEvent.clientX;
    webStartY.current = event.nativeEvent.clientY;
    webStartOffset.current = webOffset;
    webDidDrag.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - webStartX.current;
      const dy = moveEvent.clientY - webStartY.current;

      if (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(dy)) return;

      webDidDrag.current = true;
      moveEvent.preventDefault();

      const nextOffset = Math.max(
        -DELETE_ACTION_WIDTH,
        Math.min(0, webStartOffset.current + dx)
      );
      setWebOffset(nextOffset);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const dx = upEvent.clientX - webStartX.current;
      const shouldOpen = webOffset <= -8 || dx < -8;

      if (shouldOpen) {
        openWebActions();
      } else {
        closeWebActions();
      }

      setTimeout(() => {
        webDidDrag.current = false;
      }, 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrapper}>
        <View style={styles.webActions}>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={22} color="#fff" />
            <Text style={styles.deleteText}>Xoa</Text>
          </Pressable>
        </View>

        <View
          style={[styles.webSwipeRow, { transform: [{ translateX: webOffset }] }]}
          // react-native-web supports mouse events, but React Native types do not expose them here.
          {...({ onMouseDown: handleWebMouseDown } as any)}
        >
          <Pressable style={styles.container} onPress={handleWebPress} onLongPress={onLongPress}>
            <View style={styles.avatarContainer}>
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.avatarText}</Text>
                </View>
              )}
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Swipeable
        ref={swipeableRef}
        friction={1}
        rightThreshold={8}
        dragOffsetFromRightEdge={4}
        overshootRight={false}
        onSwipeableWillOpen={() => {
          isSwiping.current = true;
        }}
        onSwipeableOpen={() => {
          isSwipeOpen.current = true;
          setTimeout(() => {
            isSwiping.current = false;
          }, 120);
        }}
        onSwipeableClose={() => {
          isSwipeOpen.current = false;
          setTimeout(() => {
            isSwiping.current = false;
          }, 120);
        }}
        renderRightActions={renderRightActions}
      >
        <Pressable style={styles.container} onPress={handlePress} onLongPress={onLongPress}>
          <View style={styles.avatarContainer}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.avatarText}</Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.preview} numberOfLines={1}>
              {item.preview}
            </Text>
          </View>
        </Pressable>
      </Swipeable>
    </View>
>>>>>>> main
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  wrapper: {
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#050505",
  },
  deleteButton: {
    width: DELETE_ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef0000",
  },
  deleteText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  webActions: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: "#050505",
  },
  webSwipeRow: {
    backgroundColor: "#050505",
    transitionDuration: "120ms",
  } as any,
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#050505",
  },
  avatarContainer: { marginRight: 12 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1e5eff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  contentContainer: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { color: "#ffffff", fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
  time: { color: "#9ca3af", fontSize: 12 },
  preview: { color: "#9ca3af", fontSize: 14 },
});
>>>>>>> main
