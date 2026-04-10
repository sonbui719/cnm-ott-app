import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Group, User } from "../../types";
import { C } from "../../styles/colors";
import PrimaryButton from "../ui/PrimaryButton";

type Props = {
  group: Group;
  users: User[];
};

export default function GroupCard({ group, users }: Props) {
  const avatars = users.filter((u) => group.members.includes(u.id)).slice(0, 4);

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{group.avatar}</Text>
      <Text style={styles.name}>{group.name}</Text>
      <Text style={styles.sub}>{group.members.length} thành viên • {group.role}</Text>
      <Text style={styles.desc}>{group.description}</Text>

      <View style={styles.avatarRow}>
        {avatars.map((u) => (
          <Text key={u.id} style={styles.avatar}>{u.avatar}</Text>
        ))}
      </View>

      <PrimaryButton title="Chat" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
  },
  icon: {
    fontSize: 32,
    marginBottom: 10,
  },
  name: {
    color: C.text,
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 4,
  },
  sub: {
    color: C.muted,
    marginBottom: 12,
  },
  desc: {
    color: C.muted,
    lineHeight: 20,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  avatar: {
    fontSize: 22,
    marginRight: 6,
  },
});