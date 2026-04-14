import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TaskColumn from '../components/tasks/TaskColumn';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { TaskItem, TaskStatus } from '../components/tasks/TaskCard';

const initialTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Viết content cho landing page',
    description: 'Soạn nội dung cho trang chủ và các trang giới thiệu sản phẩm',
    priority: 'medium',
    status: 'todo',
    assignee: 'A',
    dueDate: '25/03',
  },
  {
    id: '2',
    title: 'Setup CI/CD pipeline',
    description: 'Cấu hình GitHub Actions cho việc deploy tự động',
    priority: 'medium',
    status: 'todo',
    assignee: 'B',
    dueDate: '30/03',
  },
  {
    id: '3',
    title: 'Implement API authentication',
    description: 'Xây dựng hệ thống xác thực JWT cho API',
    priority: 'high',
    status: 'inprogress',
    assignee: 'D',
    dueDate: '20/03',
  },
  {
    id: '4',
    title: 'Review và optimize database queries',
    description: 'Kiểm tra và tối ưu các truy vấn database để cải thiện hiệu năng',
    priority: 'low',
    status: 'inprogress',
    assignee: 'C',
    dueDate: '05/04',
  },
  {
    id: '5',
    title: 'Hoàn thành thiết kế UI dashboard',
    description:
      'Thiết kế giao diện dashboard cho admin panel với các biểu đồ thống kê',
    priority: 'high',
    status: 'done',
    assignee: 'L',
    dueDate: '10/03',
    comments: 1,
  },
];

const navItems = [
  { key: 'messages', label: 'Tin nhắn', icon: 'message-circle' },
  { key: 'groups', label: 'Nhóm', icon: 'users' },
  { key: 'tasks', label: 'Công việc', icon: 'check-square' },
  { key: 'assistant', label: 'Trợ lý AI', icon: 'cpu' },
  { key: 'stats', label: 'Thống kê', icon: 'bar-chart-2' },
];

export default function TaskScreen() {
  const { width } = useWindowDimensions();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [modalVisible, setModalVisible] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const todoTasks = useMemo(
    () => tasks.filter((task) => task.status === 'todo'),
    [tasks]
  );
  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === 'inprogress'),
    [tasks]
  );
  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === 'done'),
    [tasks]
  );

  const columnWidth = Math.min(width - 44, 340);

  const openCreateModal = (status: TaskStatus = 'todo') => {
    setDefaultStatus(status);
    setModalVisible(true);
  };

  const handleCreateTask = (task: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
  }) => {
    const assigneeLetter =
      task.assignee === 'Chưa giao' ? '?' : task.assignee[0].toUpperCase();

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: assigneeLetter,
      dueDate: task.dueDate,
      comments: 0,
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>StartupChat</Text>
                <Text style={styles.brandSubtitle}>OTT cho Startup</Text>
              </View>
            </View>

            <Pressable style={styles.iconCircle}>
              <Feather name="bell" size={18} color="#C7CEDD" />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.navScroll}
          >
            {navItems.map((item) => {
              const active = item.key === 'tasks';

              return (
                <Pressable
                  key={item.key}
                  style={[styles.navItem, active && styles.navItemActive]}
                >
                  <Feather
                    name={item.icon as any}
                    size={16}
                    color={active ? '#4F6BFF' : '#8B92A5'}
                  />
                  <Text
                    style={[styles.navText, active && styles.navTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>Quản lý công việc</Text>
            <Text style={styles.screenSubtitle}>
              Theo dõi và quản lý các task của nhóm
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => openCreateModal('todo')}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Tạo task mới</Text>
            </Pressable>
          </View>

          <View style={styles.toolbarWrap}>
            <Pressable style={styles.filterButton}>
              <Feather name="filter" size={15} color="#A1A7B8" />
              <Text style={styles.filterButtonText}>Tất cả nhóm</Text>
              <Ionicons name="chevron-down" size={15} color="#8F96A8" />
            </Pressable>

            <View style={styles.segment}>
              <Pressable
                style={[
                  styles.segmentButton,
                  viewMode === 'board' && styles.segmentButtonActive,
                ]}
                onPress={() => setViewMode('board')}
              >
                <MaterialCommunityIcons
                  name="view-dashboard-outline"
                  size={16}
                  color={viewMode === 'board' ? '#E5E7EB' : '#8A91A3'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    viewMode === 'board' && styles.segmentTextActive,
                  ]}
                >
                  Board
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.segmentButton,
                  viewMode === 'list' && styles.segmentButtonActive,
                ]}
                onPress={() => setViewMode('list')}
              >
                <Feather
                  name="list"
                  size={16}
                  color={viewMode === 'list' ? '#E5E7EB' : '#8A91A3'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    viewMode === 'list' && styles.segmentTextActive,
                  ]}
                >
                  Danh sách
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroll}
          >
            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.statChipText}>Tổng: {tasks.length}</Text>
            </View>

            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statChipText}>
                Đang làm: {inProgressTasks.length}
              </Text>
            </View>

            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.statChipText}>Xong: {doneTasks.length}</Text>
            </View>
          </ScrollView>

          {viewMode === 'board' ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.boardContent}
            >
              <TaskColumn
                title="Cần làm"
                count={todoTasks.length}
                status="todo"
                tasks={todoTasks}
                width={columnWidth}
                onAdd={() => openCreateModal('todo')}
              />

              <TaskColumn
                title="Đang làm"
                count={inProgressTasks.length}
                status="inprogress"
                tasks={inProgressTasks}
                width={columnWidth}
                onAdd={() => openCreateModal('inprogress')}
              />

              <TaskColumn
                title="Hoàn thành"
                count={doneTasks.length}
                status="done"
                tasks={doneTasks}
                width={columnWidth}
                onAdd={() => openCreateModal('done')}
              />
            </ScrollView>
          ) : (
            <View>
              {[...tasks]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .map((task) => (
                  <View key={task.id} style={styles.listCard}>
                    <Text style={styles.listTitle}>{task.title}</Text>
                    <Text style={styles.listDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                  </View>
                ))}
            </View>
          )}
        </ScrollView>

        <CreateTaskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={handleCreateTask}
          defaultStatus={defaultStatus}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B11',
  },
  container: {
    flex: 1,
    backgroundColor: '#080B11',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#1F3B8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  brandTitle: {
    color: '#ECEFF5',
    fontSize: 19,
    fontWeight: '800',
  },
  brandSubtitle: {
    color: '#72798B',
    fontSize: 12,
    marginTop: 2,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111622',
    borderWidth: 1,
    borderColor: '#1F2635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navScroll: {
    marginBottom: 18,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F131C',
    borderWidth: 1,
    borderColor: '#1D2330',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginRight: 10,
  },
  navItemActive: {
    backgroundColor: '#111826',
    borderColor: '#243A78',
  },
  navText: {
    color: '#8B92A5',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  navTextActive: {
    color: '#4F6BFF',
  },
  headerBlock: {
    marginBottom: 18,
  },
  screenTitle: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  screenSubtitle: {
    color: '#7F879A',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#4F6BFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  toolbarWrap: {
    marginBottom: 14,
  },
  filterButton: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#232734',
    backgroundColor: '#0F131C',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  filterButtonText: {
    color: '#D1D5DB',
    fontSize: 13.5,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0F131C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#232734',
    padding: 4,
  },
  segmentButton: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#171C28',
  },
  segmentText: {
    color: '#8A91A3',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  segmentTextActive: {
    color: '#F3F4F6',
  },
  statsScroll: {
    marginBottom: 16,
  },
  statChip: {
    height: 36,
    borderRadius: 999,
    backgroundColor: '#0F131C',
    borderWidth: 1,
    borderColor: '#1E2431',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statChipText: {
    color: '#9CA3AF',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  boardContent: {
    paddingRight: 2,
  },
  listCard: {
    backgroundColor: '#11141B',
    borderWidth: 1,
    borderColor: '#222838',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  listTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  listDescription: {
    color: '#7E869A',
    fontSize: 12.5,
    lineHeight: 18,
  },
});
