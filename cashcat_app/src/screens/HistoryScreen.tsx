import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, SectionList, StyleSheet, Platform, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { getExpenses, saveExpenses } from '../utils/storage';

function groupExpenses(expenses: any[]) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfWeek = (() => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay());
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const sections: { title: string; data: any[] }[] = [];
  const months: { [key: string]: any[] } = {};
  const week: any[] = [];
  const todayArr: any[] = [];

  expenses.forEach(e => {
    const date = new Date(e.date || e.id);
    const time = date.getTime();
    if (time >= startOfToday) {
      todayArr.push(e);
    } else if (time >= startOfWeek) {
      week.push(e);
    } else {
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!months[key]) months[key] = [];
      months[key].push(e);
    }
  });
  if (todayArr.length) sections.push({ title: 'Today', data: todayArr });
  if (week.length) sections.push({ title: 'This Week', data: week });
  Object.keys(months).reverse().forEach(m => {
    sections.push({ title: m, data: months[m] });
  });
  return sections;
}


export default function HistoryScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = expenses.filter(e => e.id !== id);
          setExpenses(updated);
          await saveExpenses(updated);
        }
      }
    ]);
  };
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        const data = await getExpenses();
        if (isActive) {
          setExpenses(data.sort((a: any, b: any) => (b.date ? new Date(b.date).getTime() : b.id) - (a.date ? new Date(a.date).getTime() : a.id)));
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  const sections = groupExpenses(expenses);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: topGap }}>
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { flexDirection: 'column', alignItems: 'stretch' }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold', flexShrink: 1 }}>
                {item.name}
                {item.tags && item.tags.length > 0 ? ` : ${item.tags[0]}` : ''}
                {item.recurring ? ' 🔁' : ''}
              </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15, textAlign: 'right', minWidth: 80 }}>
                ₹{Number(item.amount).toLocaleString('en-IN')}
              </Text>
            </View>
            {item.description ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{item.description}</Text>
                {item.date ? null : (
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={{ padding: 4, marginLeft: 8 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
            {item.date ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  {(() => {
                    const d = new Date(item.date);
                    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
                      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  })()}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={{ padding: 4, marginLeft: 8 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ) : !item.description ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={{ padding: 4, marginLeft: 8 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No expenses yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    marginHorizontal: 8,
    elevation: 1,
  },
});
