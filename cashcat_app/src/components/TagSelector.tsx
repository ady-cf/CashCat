import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { getTags } from '../utils/tagsStorage';

interface TagSelectorProps {
  selectedTags: string[];
  onSelect: (tag: string) => void;
}

export default function TagSelector({ selectedTags, onSelect }: TagSelectorProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    (async () => {
      const loaded = await getTags();
      setTags(loaded);
    })();
  }, []);

  const filtered = filter
    ? tags.filter(t => t.toLowerCase().includes(filter.toLowerCase()))
    : tags;

  return (
    <View style={{ marginBottom: 8 }}>
      <TextInput
        placeholder="Search or add tag"
        value={filter}
        onChangeText={setFilter}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 6 }}
      />
      <FlatList
        data={filtered}
        horizontal
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            style={{
              backgroundColor: selectedTags.includes(item) ? '#2196f3' : '#e0e0e0',
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
              marginRight: 6,
            }}
          >
            <Text style={{ color: selectedTags.includes(item) ? '#fff' : '#000' }}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No tags found.</Text>}
      />
    </View>
  );
}
