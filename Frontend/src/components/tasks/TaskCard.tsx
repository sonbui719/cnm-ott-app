import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;
  comments?: number;
}

interface Props {
  task: TaskItem;
}

const priorityMap = {
  low: {
    label: 'Thấp',
    textColor: '#4ADE80',
    bgColor: 'rgba(34,197,94,0.14)',
    borderColor: 'rgba(34,197,94,0.24)',
  },
  medium: {
    label: 'Trung bình',
    textColor: '#FBBF24',
    bgColor: 'rgba(245,158,11,0.14)',
    borderColor: 'rgba(245,158,11,0.24)',
  },
  high: {
    label: 'Cao',
    textColor: '#FB7185',
    bgColor: 'rgba(239,68,68,0.14)',
    borderColor: 'rgba(239,68,68,0.24)',
  },
};

export default function TaskCard({ task }: Props) {
  const priority = priorityMap[task.priority];

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      <Text style={styles.description} numberOfLines={3}>
        {task.description}
      </Text>

      <View
        style={[
          styles.priorityBadge,
          {
            backgroundColor: priority.bgColor,
            borderColor: priority.borderColor,
          },
        ]}
      >
        <Text style={[styles.priorityText, { color: priority.textColor }]}>
          {priority.label}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.leftSide}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {task.assignee?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          {!!task.comments && (
            <View style={styles.commentWrap}>
              <Feather name="message-circle" size={13} color="#8C93A8" />
              <Text style={styles.commentText}>{task.comments}</Text>
            </View>
          )}
        </View>

        {!!task.dueDate && (
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={14} color="#F87171" />
            <Text style={styles.dateText}>{task.dueDate}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: '#222838',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 8,
  },
  description: {
    color: '#7E869A',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 12,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
  },
  priorityText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#2B211D',
    borderWidth: 1,
    borderColor: '#3A2B25',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FDBA74',
    fontSize: 11,
    fontWeight: '700',
  },
  commentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    color: '#8C93A8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
