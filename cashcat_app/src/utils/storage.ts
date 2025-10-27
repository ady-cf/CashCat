import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveExpenses = async (expenses: any[]) => {
  await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
};

export const getExpenses = async () => {
  const data = await AsyncStorage.getItem('expenses');
  return data ? JSON.parse(data) : [];
};