import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Task, User } from "../../types";
import { C } from "../../styles/colors";
import TaskCard from "./TaskCard";

type Props = {
  title: string;
  tasks: Task[];
  users: User[];
  color: string;
};

export default function TaskColumn({ title, tasks, users, color }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.dot, { color }]}>●</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{tasks.length}</Text>
      </View>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} users={users} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    fontSize: 12,
    marginRight: 8,
  },
  title: {
    color: C.text,
    fontWeight: "800",
    fontSize: 20,
  },
  count: {
    color: C.muted,
    marginLeft: 8,
  },
});