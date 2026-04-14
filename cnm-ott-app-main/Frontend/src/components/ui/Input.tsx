import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { C } from "../../styles/colors";

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  height?: number;
  icon?: React.ReactNode;
};

export default function Input({
  placeholder,
  value,
  onChangeText,
  multiline,
  height,
  icon,
}: Props) {
  return (
    <View style={[styles.wrap, height ? { minHeight: height } : null]}>
      {icon}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.soft}
        style={[styles.input, multiline && styles.multi]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    paddingVertical: 12,
    marginLeft: 8,
  },
  multi: {
    textAlignVertical: "top",
  },
});