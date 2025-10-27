import React, { useMemo, useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { View, Text, StyleSheet, Platform, StatusBar, Button, TextInput, Alert, Modal, Switch } from 'react-native';
const RNView = View;
import TagSelector from '../components/TagSelector';
import EditBudgetCard from '../components/EditBudgetCard';
import { saveExpenses, getExpenses } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const BUDGET_KEY = 'monthly_budget';
const DEFAULT_BUDGET = 1000;

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function getTopTagsByExpenditure(expenses: { tags?: string[]; amount?: number }[]): string[] {
  const tagTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    if (Array.isArray(e.tags)) {
      e.tags.forEach((tag: string) => {
        tagTotals[tag] = (tagTotals[tag] || 0) + (e.amount || 0);
      });
    }
  });
  return Object.entries(tagTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

export default function HomeScreen() {
  const { expenses, addExpense, reloadExpenses } = useExpenses();
  const [refresh, setRefresh] = useState(false); // to force rerender after add or budget change
  const [budget, setBudget] = useState<number>(DEFAULT_BUDGET);
  const [editBudgetVisible, setEditBudgetVisible] = useState(false);
  // Add Expense Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [recurringDate, setRecurringDate] = useState('');

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(BUDGET_KEY);
      if (stored) setBudget(Number(stored));
    })();
  }, []);

  useFocusEffect(
  React.useCallback(() => {
    // when screen comes into focus, force reload expenses
    reloadExpenses();
  }, [])
);

  const handleSaveBudget = async (newBudget: number) => {
    setBudget(newBudget);
    await AsyncStorage.setItem(BUDGET_KEY, String(newBudget));
    setRefresh(r => !r);
  };

  const monthStart = useMemo(() => getMonthStart(), []);
  const thisMonthExpenses = useMemo(() =>
    expenses.filter(e => e.id >= monthStart),
    [expenses, monthStart, refresh]
  );
  const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = budget - totalSpent;
  const formatAmount = (amt: number) => amt.toLocaleString('en-IN');
  const topTags = getTopTagsByExpenditure(thisMonthExpenses);

  // Add safe area gap at the top
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

  // Sort this month's expenses by amount descending and take top 10
  const topExpenses = [...thisMonthExpenses]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 10);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5', paddingTop: topGap }}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          {/* Monthly Expenses Card (compact) */}
          <View style={[styles.card, { minHeight: 100, marginBottom: 16 }]}> 
            <Text style={styles.cardTitle}>This Month's Expenses</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text>Budget:</Text>
              <Text style={{ fontWeight: 'bold' }}>₹{formatAmount(budget)}</Text>
            </View>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text>Total Spent:</Text>
              <Text style={{ fontWeight: 'bold' }}>₹{formatAmount(totalSpent)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Remaining:</Text>
              <Text style={{ fontWeight: 'bold', color: remaining < 0 ? 'red' : 'green' }}>₹{formatAmount(remaining)}</Text>
            </View>
          </View>

          {/* Top Expenditure Tags */}
          <View style={[styles.card, { minHeight: 100, marginBottom: 16 }]}> 
            <Text style={styles.cardTitle}>Top Expenditure Tags this Month</Text>
            {topTags.length === 0 ? (
              <Text style={{ color: '#888' }}>No tag data yet.</Text>
            ) : (
              topTags.map((tag) => {
                // Calculate total spent for this tag
                const tagTotal = thisMonthExpenses
                  .filter(e => Array.isArray(e.tags) && e.tags.includes(tag))
                  .reduce((sum, e) => sum + (e.amount || 0), 0);
                return (
                  <View key={tag} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 15 }}>{tag}</Text>
                    <Text style={{ fontWeight: 'bold' }}>₹{formatAmount(tagTotal)}</Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Top Expenses This Month */}
          <View style={[styles.card, { minHeight: 100, marginBottom: 16, flexGrow: 1, flexShrink: 1, flexBasis: 0 }]}> 
            <Text style={styles.cardTitle}>Top Expenses this Month</Text>
            {topExpenses.length === 0 ? (
              <Text style={{ color: '#888' }}>No expenses yet this month.</Text>
            ) : (
              <View style={{ flex: 1 }}>
                {topExpenses.map((item, idx) => (
                  <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text numberOfLines={1} style={{ maxWidth: 180 }}>
                      {item.name || item.description}
                      {item.tags && item.tags.length > 0 ? ` : ${item.tags[0]}` : ''}
                      {item.recurring ? ' 🔁' : ''}
                    </Text>
                    <Text style={{ fontWeight: 'bold' }}>₹{formatAmount(item.amount)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{}}>
          {/* Add Expense Button */}
          <Button title="Add Expense" onPress={() => setAddModalVisible(true)} />
          <View style={{ height: 12 }} />
          {/* Edit Budget Button */}
          <Button title="Edit Budget" onPress={() => setEditBudgetVisible(true)} color="#4caf50" />
        </View>
      </View>

      {/* Add Expense Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <RNView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <RNView style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320, elevation: 5 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Add Expense</Text>
            <TextInput placeholder="Name*" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
            <TextInput placeholder="Amount*" value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
            <TagSelector selectedTags={tag ? [tag] : []} onSelect={selected => setTag(selected === tag ? null : selected)} />
            {tag && (
              <RNView style={{ backgroundColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 }}>
                <Text>{tag}</Text>
              </RNView>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Switch value={recurring} onValueChange={setRecurring} />
              <Text style={{ marginLeft: 8 }}>Recurring</Text>
            </View>
            {recurring && (
              <TextInput
                placeholder="Recurring Day (1-31)"
                value={recurringDate}
                onChangeText={text => {
                  // Only allow numbers 1-31
                  if (/^\d{0,2}$/.test(text) && (text === '' || (Number(text) >= 1 && Number(text) <= 31))) {
                    setRecurringDate(text);
                  }
                }}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }}
              />
            )}
            <Button
              title={adding ? 'Adding...' : 'Add'}
              onPress={async () => {
                if (!name.trim() || !amount.trim()) {
                  Alert.alert('Name and Amount are required');
                  return;
                }
                if (!tag) {
                  Alert.alert('No tag selected', 'Please select a tag.');
                  return;
                }
                setAdding(true);
                const expense = {
                  id: Date.now(),
                  name: name.trim(),
                  description: description.trim(),
                  amount: Number(amount),
                  tags: [tag],
                  date: new Date().toISOString(),
                  recurring,
                  recurringDate: recurring ? recurringDate : undefined,
                };
                const prev = await getExpenses();
                await saveExpenses([...prev, expense]);
                await addExpense(name.trim(), Number(amount), recurring, [tag], description.trim());
                setRefresh(r => !r);
                setName('');
                setDescription('');
                setAmount('');
                setTag(null);
                setRecurring(false);
                setRecurringDate('');
                setAdding(false);
                setAddModalVisible(false);
              }}
              disabled={adding}
            />
            <Button title="Cancel" onPress={() => setAddModalVisible(false)} color="#888" />
          </RNView>
        </RNView>
      </Modal>

      {/* Edit Budget Modal */}
      <EditBudgetCard
        visible={editBudgetVisible}
        onClose={() => setEditBudgetVisible(false)}
        budget={budget}
        onSave={handleSaveBudget}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
});
