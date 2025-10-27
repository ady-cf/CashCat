import AsyncStorage from '@react-native-async-storage/async-storage';

const TAGS_KEY = 'tags_list';
const DEFAULT_TAGS = [
  'Bills', 'Groceries', 'Travel', 'Shopping', 'Health', 'Food', 'Education', 'Entertainment', 'Rent', 'Utilities'
];

export const getTags = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(TAGS_KEY);
  if (data) {
    return JSON.parse(data);
  } else {
    
    await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(DEFAULT_TAGS));
    return [...DEFAULT_TAGS];
  }
};

export const saveTags = async (tags: string[]): Promise<void> => {
  await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(tags));
};
