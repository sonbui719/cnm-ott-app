import React, { forwardRef, memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = TextInputProps & {
  label?: string;
  icon?: IconName;
  rightElement?: React.ReactNode;
};

const FormInput = memo(
  forwardRef<TextInput, Props>(function FormInput(
    { label, icon, rightElement, multiline = false, numberOfLines = 1, style, ...rest },
    ref
  ) {
    return (
      <View style={styles.group}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View style={[styles.wrap, multiline && styles.wrapArea]}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color="#9ca3af"
              style={styles.leftIcon}
            />
          ) : null}

          <TextInput
            ref={ref}
            placeholderTextColor="#707784"
            multiline={multiline}
            numberOfLines={numberOfLines}
            style={[
              styles.input,
              icon ? { paddingLeft: 40 } : { paddingLeft: 14 },
              rightElement ? { paddingRight: 44 } : null,
              multiline && styles.inputArea,
              style,
            ]}
            {...rest}
          />

          {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
        </View>
      </View>
    );
  })
);

export default FormInput;

const styles = StyleSheet.create({
  group: {
    marginBottom: 14,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  wrap: {
    position: "relative",
    justifyContent: "center",
  },
  wrapArea: {
    minHeight: 110,
    alignItems: "flex-start",
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#414141",
    backgroundColor: "#161b26",
    color: "#fff",
    fontSize: 15,
    paddingRight: 12,
  },
  inputArea: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  leftIcon: {
    position: "absolute",
    left: 12,
    zIndex: 2,
  },
  right: {
    position: "absolute",
    right: 12,
    zIndex: 2,
  },
});