import React, { useState } from 'react';
import { View, TextInput, Button, Switch, Text } from 'react-native';

interface ExpenseFormProps {
  onSubmit: (description: string, amount: number, recurring: boolean) => void;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recurring, setRecurring] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Recurring</Text>
        <Switch value={recurring} onValueChange={setRecurring} />
      </View>
      <Button
        title="Add Expense"
        onPress={() => {
          if (description && amount) {
            onSubmit(description, Number(amount), recurring);
            setDescription('');
            setAmount('');
            setRecurring(false);
          }
        }}
      />
    </View>
  );
}
