import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useExpenses } from '../hooks/useExpenses';

export default function AddExpenseScreen() {
  const { addExpense } = useExpenses();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput placeholder="Amount" value={amount} keyboardType="numeric" onChangeText={setAmount} />
      <Button title="Add Expense" onPress={() => addExpense(description, Number(amount), false)} />
    </View>
  );
}
