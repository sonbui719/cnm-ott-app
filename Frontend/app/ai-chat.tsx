import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function AIChatScreen() {
  // Biến lưu trữ tin nhắn, AI sẽ chào trước
  const [messages, setMessages] = useState([
    { text: "Chào bạn, mình là Trợ lý AI. Mình có thể giúp gì cho công việc của bạn?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    // 1. Hiện tin nhắn của người dùng lên màn hình
    const userText = input;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      // 2. Gửi câu hỏi lên Backend của bạn
      // Lấy địa chỉ API từ file .env (nhớ thêm /api-chat vào đuôi)
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://192.168.1.71:5000';
      
      const response = await fetch(`${apiUrl}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });

      const data = await response.json();

      // 3. Nhận câu trả lời từ AI và hiện lên màn hình
      if (data.success) {
        setMessages(prev => [...prev, { text: data.answer, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: "Lỗi: " + data.message, isBot: true }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Mất kết nối với máy chủ Backend!", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <Stack.Screen options={{ title: "Trợ lý AI" }} />
      
      <ScrollView style={styles.chatArea}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.isBot ? styles.botMessage : styles.userMessage]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 10 }} />}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Hỏi AI điều gì đó..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Chút CSS cho giao diện giống màu tối của app FinChat
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  chatArea: { flex: 1, padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 15 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#3b82f6' },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#334155' },
  messageText: { color: '#ffffff', fontSize: 16 },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: '#1e293b' },
  input: { flex: 1, backgroundColor: '#334155', color: '#fff', borderRadius: 20, paddingHorizontal: 15, fontSize: 16 },
  sendButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#3b82f6', borderRadius: 20, paddingHorizontal: 20, marginLeft: 10 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});