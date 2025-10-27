import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import TagSelector from './TagSelector';
import { saveExpenses, getExpenses } from '../utils/storage';

interface AddExpenseCardProps {
  onAdd: (name: string, description: string, amount: number, tags: string[]) => void;
}

export default function AddExpenseCard({ onAdd }: AddExpenseCardProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const handleSelectTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAdd = async () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Name and Amount are required');
      return;
    }
    setAdding(true);
    const expense = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      amount: Number(amount),
      tags,
      date: new Date().toISOString(),
    };
    if (tags.length > 0) {
      const prev = await getExpenses();
      await saveExpenses([...prev, expense]);
      onAdd(name, description, Number(amount), tags);
    } else {
      Alert.alert('No tag selected', 'Would ping backend for tag suggestion.');
    }
    setName('');
    setDescription('');
    setAmount('');
    setTags([]);
    setAdding(false);
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 8, elevation: 2 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Add Expense</Text>
      <TextInput placeholder="Name*" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Amount*" value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
      <TagSelector selectedTags={tags} onSelect={handleSelectTag} />
      <FlatList
        data={tags}
        horizontal
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 }}>
            <Text>{item}</Text>
          </View>
        )}
        style={{ marginBottom: 8 }}
      />
      <Button title={adding ? 'Adding...' : 'Add'} onPress={handleAdd} disabled={adding} />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#2196f3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 10,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    elevation: 5,
  },
});
