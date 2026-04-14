import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskPriority, TaskStatus } from './TaskCard';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
  onCreate: (task: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string;
    dueDate: string;
  }) => void;
}

type SelectOption = {
  label: string;
  value: string;
};

function SelectField({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const selectedLabel = useMemo(() => {
    return options.find((item) => item.value === value)?.label || '';
  }, [options, value]);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.selectBox} onPress={onToggle}>
        <Text style={styles.selectText}>{selectedLabel}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#8F96A8"
        />
      </Pressable>

      {isOpen && (
        <View style={styles.optionsWrap}>
          {options.map((item) => {
            const active = item.value === value;

            return (
              <Pressable
                key={item.value}
                style={[styles.optionItem, active && styles.optionItemActive]}
                onPress={() => onSelect(item.value)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function CreateTaskModal({
  visible,
  onClose,
  onCreate,
  defaultStatus = 'todo',
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('unassigned');
  const [dueDate, setDueDate] = useState('');
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssignee('unassigned');
      setDueDate('');
      setOpenSelect(null);
    }
  }, [visible, defaultStatus]);

  const handleCreate = () => {
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee:
        assignee === 'unassigned'
          ? 'Chưa giao'
          : assignee === 'an'
          ? 'An'
          : assignee === 'binh'
          ? 'Bình'
          : assignee === 'chi'
          ? 'Chi'
          : 'Dũng',
      dueDate: dueDate.trim(),
    });

    onClose();
  };

  const isDisabled = !title.trim();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heading}>Tạo task mới</Text>
              <Text style={styles.subheading}>
                Tạo một công việc mới để theo dõi
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={18} color="#9BA3B7" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Tiêu đề *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề task..."
                placeholderTextColor="#646B7D"
                style={styles.inputFocused}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết task..."
                placeholderTextColor="#646B7D"
                style={styles.textarea}
                multiline
                textAlignVertical="top"
              />
            </View>

            <SelectField
              label="Trạng thái"
              value={status}
              isOpen={openSelect === 'status'}
              onToggle={() =>
                setOpenSelect(openSelect === 'status' ? null : 'status')
              }
              onSelect={(value) => {
                setStatus(value as TaskStatus);
                setOpenSelect(null);
              }}
              options={[
                { label: 'Cần làm', value: 'todo' },
                { label: 'Đang làm', value: 'inprogress' },
                { label: 'Hoàn thành', value: 'done' },
              ]}
            />

            <SelectField
              label="Độ ưu tiên"
              value={priority}
              isOpen={openSelect === 'priority'}
              onToggle={() =>
                setOpenSelect(openSelect === 'priority' ? null : 'priority')
              }
              onSelect={(value) => {
                setPriority(value as TaskPriority);
                setOpenSelect(null);
              }}
              options={[
                { label: 'Thấp', value: 'low' },
                { label: 'Trung bình', value: 'medium' },
                { label: 'Cao', value: 'high' },
              ]}
            />

            <SelectField
              label="Người thực hiện"
              value={assignee}
              isOpen={openSelect === 'assignee'}
              onToggle={() =>
                setOpenSelect(openSelect === 'assignee' ? null : 'assignee')
              }
              onSelect={(value) => {
                setAssignee(value);
                setOpenSelect(null);
              }}
              options={[
                { label: 'Chưa giao', value: 'unassigned' },
                { label: 'An', value: 'an' },
                { label: 'Bình', value: 'binh' },
                { label: 'Chi', value: 'chi' },
                { label: 'Dũng', value: 'dung' },
              ]}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Deadline</Text>
              <View style={styles.dateBox}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#8F96A8"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Chọn ngày"
                  placeholderTextColor="#646B7D"
                  style={styles.dateInput}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.submitButton, isDisabled && styles.submitDisabled]}
              onPress={handleCreate}
              disabled={isDisabled}
            >
              <Text style={styles.submitText}>Tạo task</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4,8,15,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modal: {
    maxHeight: '92%',
    backgroundColor: '#0F1219',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#232938',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heading: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subheading: {
    color: '#7F879A',
    fontSize: 13.5,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#141925',
    borderWidth: 1,
    borderColor: '#242B3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  content: {
    paddingBottom: 8,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputFocused: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4F6BFF',
    backgroundColor: '#10151F',
    paddingHorizontal: 14,
    color: '#F4F6FB',
    fontSize: 15,
  },
  textarea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242938',
    backgroundColor: '#10151F',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    color: '#F4F6FB',
    fontSize: 15,
  },
  selectBox: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242938',
    backgroundColor: '#10151F',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#F4F6FB',
    fontSize: 15,
  },
  optionsWrap: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242938',
    backgroundColor: '#131824',
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#202534',
  },
  optionItemActive: {
    backgroundColor: '#1A2232',
  },
  optionText: {
    color: '#D5DAE6',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  dateBox: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242938',
    backgroundColor: '#10151F',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    color: '#F4F6FB',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  cancelButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#141925',
    borderWidth: 1,
    borderColor: '#242B3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#4F6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
