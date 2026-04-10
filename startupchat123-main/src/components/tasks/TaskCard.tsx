import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Task, User } from "../../types";
import { C } from "../../styles/colors";

type Props = {
  task: Task;
  users: User[];
};

export default function TaskCard({ task, users }: Props) {
  const assignee = users.find((u) => u.id === task.assigneeId);

  const priorityColor =
    task.priority === "Cao" ? C.danger : task.priority === "Trung bình" ? C.warning : C.success;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.desc}>{task.description}</Text>

      <View style={[styles.tag, { backgroundColor: `${priorityColor}22` }]}>
        <Text style={[styles.tagText, { color: priorityColor }]}>{task.priority}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.avatar}>{assignee?.avatar || "🧑‍💼"}</Text>
        <Text style={styles.date}>{task.dueDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    color: C.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 6,
  },
  desc: {
    color: C.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    fontSize: 22,
  },
  date: {
    color: C.danger,
    fontWeight: "600",
  },
});