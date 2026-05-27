import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Conversation } from '../../data/messageData';

type Props = { item: Conversation; onPress: () => void; onLongPress?: () => void; };

export default function ConversationItem({ item, onPress, onLongPress }: Props) {
  return (
    <Pressable style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.avatarText}</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>{item.preview}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937', alignItems: 'center' },
  avatarContainer: { marginRight: 12 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e5eff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  contentContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  time: { color: '#9ca3af', fontSize: 12 },
  preview: { color: '#9ca3af', fontSize: 14 }
});