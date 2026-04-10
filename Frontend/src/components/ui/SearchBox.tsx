import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { C } from "../../styles/colors";

export default function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <View style={styles.box}>
      <Feather name="search" size={16} color={C.soft} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.soft}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: C.text,
    marginLeft: 8,
  },
});