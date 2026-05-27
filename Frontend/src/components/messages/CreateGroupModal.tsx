import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, StyleSheet, Pressable, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config/api';
import { getAuthSession } from '../../store/authStore';

type SearchedUser = { _id: string; fullName: string; phone: string; email: string; };

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void; };

export default function CreateGroupModal({ visible, onClose, onSuccess }: Props) {
  const [groupName, setGroupName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const session = getAuthSession();
      const res = await fetch(`${API_BASE_URL}/users/search?q=${keyword}`, {
        headers: { 'Authorization': `Bearer ${session?.token}` }
      });
      setResults(await res.json());
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    } finally { setLoading(false); }
  };

  const toggleUser = (user: SearchedUser) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
    if (selectedUsers.length < 2) return Alert.alert("Lỗi", "Vui lòng chọn ít nhất 2 thành viên");

    setCreating(true);
    try {
      const session = getAuthSession();
      const userIds = selectedUsers.map(u => u._id);
      
      const res = await fetch(`${API_BASE_URL}/chat/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.token}` },
        body: JSON.stringify({ name: groupName, users: userIds })
      });
      
      if (res.ok) {
        Alert.alert("Thành công", "Tạo nhóm thành công!");
        setGroupName(''); setSelectedUsers([]); setResults([]);
        onClose();
        onSuccess(); // Gọi hàm refresh danh sách chat
      } else {
        const data = await res.json();
        Alert.alert("Lỗi", data.message);
      }
    } catch (error) {
      console.error("Lỗi tạo nhóm:", error);
    } finally { setCreating(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Tạo Nhóm Mới</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </Pressable>
          </View>

          <TextInput style={styles.groupNameInput} placeholder="Nhập tên nhóm..." placeholderTextColor="#6b7280" value={groupName} onChangeText={setGroupName} />

          {selectedUsers.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedArea}>
              {selectedUsers.map(u => (
                <View key={u._id} style={styles.selectedBadge}>
                  <Text style={styles.selectedText}>{u.fullName}</Text>
                  <Pressable onPress={() => toggleUser(u)}><Ionicons name="close-circle" size={16} color="#ef4444" /></Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.searchRow}>
            <View style={styles.inputBox}>
              <Ionicons name="search" size={20} color="#8f96a3" />
              <TextInput style={styles.input} placeholder="Tìm bạn bè (Tên/SĐT)..." placeholderTextColor="#6b7280" value={keyword} onChangeText={setKeyword} onSubmitEditing={handleSearch} />
            </View>
            <Pressable style={styles.searchBtn} onPress={handleSearch}><Text style={styles.searchBtnText}>Tìm</Text></Pressable>
          </View>

          {loading ? <ActivityIndicator size="large" color="#1e5eff" style={{ marginTop: 20 }} /> : (
            <FlatList
              data={results}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => {
                const isSelected = selectedUsers.some(u => u._id === item._id);
                return (
                  <Pressable style={[styles.userCard, isSelected && styles.userCardSelected]} onPress={() => toggleUser(item)}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.fullName[0].toUpperCase()}</Text></View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.fullName}</Text>
                      <Text style={styles.userPhone}>{item.phone}</Text>
                    </View>
                    {isSelected ? <Ionicons name="checkmark-circle" size={24} color="#22c55e" /> : <Ionicons name="ellipse-outline" size={24} color="#4b5563" />}
                  </Pressable>
                );
              }}
            />
          )}

          <Pressable style={[styles.createBtn, (selectedUsers.length < 2 || !groupName) && styles.createBtnDisabled]} onPress={handleCreateGroup} disabled={selectedUsers.length < 2 || !groupName || creating}>
            <Text style={styles.createBtnText}>{creating ? "Đang tạo..." : "Xác Nhận Tạo Nhóm"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111214', height: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: '#222' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 5, backgroundColor: '#1a1c20', borderRadius: 20 },
  groupNameInput: { backgroundColor: '#1a1c20', borderRadius: 12, paddingHorizontal: 16, height: 50, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 15 },
  selectedArea: { maxHeight: 40, marginBottom: 15 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e3a8a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, gap: 5 },
  selectedText: { color: '#dbeafe', fontSize: 13, fontWeight: '600' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  inputBox: { flex: 1, flexDirection: 'row', backgroundColor: '#1a1c20', borderRadius: 12, paddingHorizontal: 12, height: 48, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, color: '#fff', marginLeft: 8, fontSize: 15 },
  searchBtn: { backgroundColor: '#1e5eff', height: 48, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: 'bold' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16181b', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2a2d33' },
  userCardSelected: { borderColor: '#1e5eff', backgroundColor: 'rgba(30,94,255,0.1)' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#153566', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#9fc2ff', fontSize: 16, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  userPhone: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  createBtn: { backgroundColor: '#22c55e', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});