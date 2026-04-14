import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../styles/colors";

type Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  small?: boolean;
};

export default function PrimaryButton({ title, onPress, icon, small }: Props) {
  return (
    <TouchableOpacity style={[styles.btn, small && styles.small]} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={16} color={C.text} /> : null}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: C.primary,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  small: {
    minHeight: 42,
  },
  text: {
    color: C.text,
    fontWeight: "700",
    fontSize: 15,
  },
});