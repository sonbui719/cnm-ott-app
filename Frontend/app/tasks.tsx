import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
// Giả định các components này đã tồn tại
import TaskColumn from '../src/components/tasks/TaskColumn';
import CreateTaskModal from '../src/components/tasks/CreateTaskModal';
import { TaskItem, TaskStatus } from '../src/components/tasks/TaskCard';

const initialTasks: TaskItem[] = [
  { id: '1', title: 'Viết content cho landing page', description: 'Soạn nội dung cho trang chủ', priority: 'medium', status: 'todo', assignee: 'A', dueDate: '25/03' },
  { id: '3', title: 'Implement API auth', description: 'JWT System', priority: 'high', status: 'inprogress', assignee: 'D', dueDate: '20/03' },
];

const navItems = [
  { key: 'messages', label: 'Tin nhắn', icon: 'message-circle', route: '/messages' },
  { key: 'tasks', label: 'Công việc', icon: 'check-square', route: '/tasks' },
  { key: 'stats', label: 'Thống kê', icon: 'bar-chart-2', route: '/stats' },
];

export default function TaskScreen() {
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [modalVisible, setModalVisible] = useState(false);

  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === 'inprogress'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <View style={styles.logoBox}><Text style={styles.logoText}>S</Text></View>
              <View>
                <Text style={styles.brandTitle}>StartupChat</Text>
                <Text style={styles.brandSubtitle}>Quản lý dự án</Text>
              </View>
            </View>
          </View>

          {/* Navigation Tabs (Top) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll}>
            {navItems.map((item) => {
              const active = item.key === 'tasks';
              return (
                <Pressable
                  key={item.key}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Feather name={item.icon as any} size={16} color={active ? '#4F6BFF' : '#8B92A5'} />
                  <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>Công việc</Text>
            <Pressable style={styles.primaryButton} onPress={() => setModalVisible(true)}>
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Tạo task</Text>
            </Pressable>
          </View>

          {/* Board View */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TaskColumn title="Cần làm" count={todoTasks.length} status="todo" tasks={todoTasks} width={300} onAdd={() => {}} />
            <TaskColumn title="Đang làm" count={inProgressTasks.length} status="inprogress" tasks={inProgressTasks} width={300} onAdd={() => {}} />
          </ScrollView>

        </ScrollView>

        {/* Floating Bottom Nav (Nên dùng chung style với Messages hoặc dùng Tab Layout của Expo) */}
        <View style={styles.fakeBottomBar}>
           <Pressable style={styles.bottomTab} onPress={() => router.push('/messages')}>
              <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
           </Pressable>
           <Pressable style={[styles.bottomTab, styles.activeTab]}>
              <Ionicons name="checkbox" size={20} color="#4F6BFF" />
           </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080B11' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  brandLeft: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1F3B8A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { color: '#FFF', fontWeight: '800' },
  brandTitle: { color: '#ECEFF5', fontSize: 18, fontWeight: '800' },
  brandSubtitle: { color: '#72798B', fontSize: 11 },
  navScroll: { marginBottom: 20 },
  navItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F131C', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#1D2330' },
  navItemActive: { borderColor: '#243A78', backgroundColor: '#111826' },
  navText: { color: '#8B92A5', fontSize: 13, fontWeight: '700', marginLeft: 8 },
  navTextActive: { color: '#4F6BFF' },
  headerBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  primaryButton: { backgroundColor: '#4F6BFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 40, borderRadius: 10 },
  primaryButtonText: { color: '#FFF', fontWeight: '700', marginLeft: 5 },
  fakeBottomBar: { position: 'absolute', bottom: 20, left: 20, right: 20, height: 60, backgroundColor: '#11141B', borderRadius: 20, flexDirection: 'row', borderWidth: 1, borderColor: '#222' },
  bottomTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeTab: { borderTopWidth: 2, borderTopColor: '#4F6BFF' }
});