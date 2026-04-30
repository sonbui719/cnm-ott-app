import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../src/config/api';
import { getAuthSession } from '../../src/store/authStore';
import { getSocket } from '../../src/services/socket';

type MessageType = {
  _id: string;
  text: string;
  sender: any; 
  createdAt: string;
};

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams(); 
  const router = useRouter();
  const session = getAuthSession();
  const currentUser = session?.user;
  
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const socket = getSocket();

  useEffect(() => {
    fetchMessages();

    if (socket) {
      socket.emit('join_chat', id);

      socket.on('receive_message', (newMessage: MessageType) => {
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [id]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${id}/messages`, {
        headers: { 'Authorization': `Bearer ${session?.token}` }
      });
      const data = await res.json();
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (error) {
      console.error("Lỗi tải tin nhắn:", error);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket || !currentUser) return;

    const messageData = {
      conversationId: id,
      senderId: currentUser.id,
      text: inputText.trim(),
    };

    socket.emit('send_message', messageData);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: MessageType }) => {
    const isMe = item.sender._id === currentUser?.id || item.sender === currentUser?.id;
    
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRight : styles.msgLeft]}>
        <View style={[styles.msgBubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={styles.msgText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{name || "Đang tải..."}</Text>
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatArea}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#6b7280"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937', backgroundColor: '#0a0a0a' },
  backBtn: { marginRight: 10, padding: 5 },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerStatus: { color: '#22c55e', fontSize: 12, marginTop: 2 },
  chatArea: { paddingHorizontal: 16, paddingVertical: 10 },
  msgRow: { flexDirection: 'row', marginBottom: 12 },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  msgBubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleLeft: { backgroundColor: '#1f2937', borderBottomLeftRadius: 4 },
  bubbleRight: { backgroundColor: '#1e5eff', borderBottomRightRadius: 4 },
  msgText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1f2937', backgroundColor: '#0a0a0a' },
  input: { flex: 1, backgroundColor: '#1f2937', borderRadius: 20, color: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 40, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e5eff', alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.5 }
});