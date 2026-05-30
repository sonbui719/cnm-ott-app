import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../src/config/api';

const CHAT_STORAGE_KEY = '@ai_chat_history';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    { text: "Chào bạn, mình là Trợ lý AI. Mình có thể giúp gì cho công việc của bạn?", isBot: true, image: null }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ uri: string, base64: string } | null>(null);

  // State quản lý việc đóng/mở bảng lịch sử ở dưới cùng
  const [showHistory, setShowHistory] = useState(false);

  // 1. TẢI LỊCH SỬ CHAT KHI VÀO MÀN HÌNH
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (savedHistory) {
          setMessages(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử chat:", error);
      }
    };
    loadChatHistory();
  }, []);

  // 2. LƯU LỊCH SỬ CHAT MỖI KHI CÓ TIN NHẮN MỚI
  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        if (messages.length > 1) {
          await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        }
      } catch (error) {
        console.error("Lỗi khi lưu lịch sử chat:", error);
      }
    };
    saveChatHistory();
  }, [messages]);

  // Lấy ra danh sách các câu hỏi của User
  const userQuestions = messages.filter(msg => !msg.isBot && msg.text);

  // 3. HÀM XÓA LỊCH SỬ CHAT
  const clearChatHistory = async () => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("Bạn có chắc muốn xóa toàn bộ tin nhắn với AI không?");
      if (confirmDelete) {
        setMessages([{ text: "Chào bạn, mình là Trợ lý AI. Mình có thể giúp gì cho công việc của bạn?", isBot: true, image: null }]);
        await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
        setShowHistory(false);
      }
    } else {
      Alert.alert("Xóa cuộc trò chuyện", "Bạn có chắc muốn xóa toàn bộ tin nhắn với AI không?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setMessages([{ text: "Chào bạn, mình là Trợ lý AI. Mình có thể giúp gì cho công việc của bạn?", isBot: true, image: null }]);
            await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
            setShowHistory(false); 
          }
        }
      ]);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64
      });
    }
  };

  const sendMessage = async () => {
    if (input.trim() === "" && !selectedImage) return;

    const userText = input;
    const imageToSend = selectedImage;

    setMessages(prev => [...prev, { text: userText, isBot: false, image: imageToSend?.uri || null }]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);
    setShowHistory(false); // Tự động đóng bảng lịch sử khi gửi tin nhắn

    try {
      const chatHistory = messages
        .filter((_, index) => index !== 0)
        .map(msg => ({
          role: msg.isBot ? "model" : "user",
          text: msg.text
        }));

      const response = await fetch(`${API_BASE_URL}/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          image: imageToSend?.base64 || null,
          history: chatHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { text: data.answer, isBot: true, image: null }]);
      } else {
        setMessages(prev => [...prev, { text: "Lỗi: " + data.message, isBot: true, image: null }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Mất kết nối với máy chủ Backend!", isBot: true, image: null }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      {/* Cấu hình lại thanh Header đơn giản */}
      <Stack.Screen options={{ title: "Trợ lý AI" }} />

      {/* KHU VỰC HIỂN THỊ CHAT CHÍNH */}
      <ScrollView style={styles.chatArea}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.isBot ? styles.botMessage : styles.userMessage]}>
            {msg.image && (
              <Image source={{ uri: msg.image }} style={styles.messageImage} />
            )}
            {msg.text ? <Text style={styles.messageText}>{msg.text}</Text> : null}
          </View>
        ))}
        {loading && <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 10 }} />}
      </ScrollView>

      {/* Xem trước ảnh chuẩn bị gửi */}
      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BẢNG LỊCH SỬ CÂU HỎI (HIỆN NGAY TRÊN Ô NHẬP) */}
      {showHistory && (
        <View style={styles.historyPanel}>
          <View style={styles.historyPanelHeader}>
            <Text style={styles.historyPanelTitle}>Lịch sử câu hỏi ({userQuestions.length})</Text>
            {/* Nút Xóa chuyển vào đây */}
            <TouchableOpacity onPress={clearChatHistory}>
              <Text style={styles.clearBtnText}>🗑️ Xóa Chat</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
            {userQuestions.length === 0 ? (
              <Text style={styles.emptyHistoryText}>Bạn chưa hỏi câu nào.</Text>
            ) : (
              userQuestions.map((msg, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.historyItem}
                  onPress={() => setInput(msg.text)} // Bấm vào sẽ tự động điền câu hỏi cũ vào ô nhập
                >
                  <Text style={styles.historyItemText} numberOfLines={2}>• {msg.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* KHU VỰC NHẬP TIN NHẮN PHÍA DƯỚI */}
      <View style={styles.inputArea}>
        {/* Nút Lịch Sử (Mới) */}
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowHistory(!showHistory)}>
          <Text style={{ fontSize: 22 }}>🕒</Text>
        </TouchableOpacity>

        {/* Nút chọn ảnh */}
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Text style={{ fontSize: 22 }}>🖼️</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Hỏi AI..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  chatArea: { flex: 1, padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 15 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#3b82f6' },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#334155' },
  messageText: { color: '#ffffff', fontSize: 16 },
  messageImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 8, resizeMode: 'cover' },

  previewContainer: { paddingHorizontal: 15, paddingBottom: 10, position: 'relative', alignSelf: 'flex-start' },
  previewImage: { width: 80, height: 80, borderRadius: 10 },
  removeImageBtn: { position: 'absolute', top: -5, right: 5, backgroundColor: 'red', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removeImageText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  // CSS cho bảng lịch sử câu hỏi mới
  historyPanel: { backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155', paddingBottom: 10 },
  historyPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  historyPanelTitle: { color: '#3b82f6', fontWeight: 'bold', fontSize: 14 },
  clearBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  historyItem: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  historyItemText: { color: '#9ca3af', fontSize: 14 },
  emptyHistoryText: { color: '#6b7280', paddingVertical: 15, textAlign: 'center', fontSize: 14 },

  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#1e293b' },
  iconButton: { padding: 8, justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  input: { flex: 1, backgroundColor: '#334155', color: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, fontSize: 16, minHeight: 40, maxHeight: 100 },
  sendButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#3b82f6', borderRadius: 20, paddingHorizontal: 15, height: 40, marginLeft: 10 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});