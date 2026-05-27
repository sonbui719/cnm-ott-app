import React from "react";
import { Text, StyleSheet } from "react-native";
import { C } from "../../styles/colors";

export default function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: C.text,
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 14,
  },
});