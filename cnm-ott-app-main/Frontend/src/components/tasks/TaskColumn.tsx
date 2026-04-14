import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import TaskCard, { TaskItem, TaskStatus } from './TaskCard';

interface Props {
  title: string;
  count: number;
  status: TaskStatus;
  tasks: TaskItem[];
  width: number;
  onAdd?: () => void;
}

export default function TaskColumn({
  title,
  count,
  status,
  tasks,
  width,
  onAdd,
}: Props) {
  const renderStatusIcon = () => {
    if (status === 'inprogress') {
      return <Ionicons name="time-outline" size={15} color="#FBBF24" />;
    }

    if (status === 'done') {
      return (
        <Ionicons
          name="checkmark-circle-outline"
          size={15}
          color="#4ADE80"
        />
      );
    }

    return <Feather name="list" size={15} color="#A1A1AA" />;
  };

  return (
    <View style={[styles.column, { width }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {renderStatusIcon()}
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>

        <Pressable style={styles.addButton} onPress={onAdd}>
          <Feather name="plus" size={16} color="#C3CAD9" />
        </Pressable>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chưa có task</Text>
        </View>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    backgroundColor: '#0E1118',
    borderWidth: 1,
    borderColor: '#1D2330',
    borderRadius: 18,
    padding: 14,
    marginRight: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#F4F6FB',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#1A1F2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 7,
  },
  countText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#141925',
    borderWidth: 1,
    borderColor: '#242B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#202635',
    backgroundColor: '#11141B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6F7688',
    fontSize: 13,
    fontWeight: '600',
  },
});
