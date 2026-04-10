import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../../styles/colors";

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function FilterChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.active]} onPress={onPress}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    backgroundColor: "#161C29",
    borderColor: C.primary,
  },
  text: {
    color: C.muted,
    fontWeight: "600",
  },
  textActive: {
    color: C.text,
  },
});