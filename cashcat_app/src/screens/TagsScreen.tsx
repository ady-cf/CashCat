
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { getTags, saveTags } from '../utils/tagsStorage';


export default function TagsScreen() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await getTags();
      setTags(loaded.sort());
      setLoading(false);
    })();
  }, []);

  const persistTags = async (updated: string[]) => {
    setTags(updated.sort());
    await saveTags(updated);
  };

  const addTag = async () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updated = [...tags, newTag.trim()];
      await persistTags(updated);
      setNewTag('');
      setModalVisible(false);
    }
  };

  const startEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(tags[idx]);
  };

  const saveEdit = async () => {
    if (editIndex !== null && editValue.trim()) {
      const updated = [...tags];
      updated[editIndex] = editValue.trim();
      await persistTags(updated);
      setEditIndex(null);
      setEditValue('');
    }
  };

  const startDelete = (idx: number) => {
    setDeleteIndex(idx);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (deleteIndex !== null) {
      const updated = [...tags];
      updated.splice(deleteIndex, 1);
      await persistTags(updated);
      setDeleteIndex(null);
      setConfirmDeleteVisible(false);
    }
  };

  // Add safe area gap at the top
  const topGap = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: topGap }}>
      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={tags}
          keyExtractor={item => item}
          renderItem={({ item, index }) => (
            <View style={styles.tagRow}>
              {editIndex === index ? (
                <>
                  <TextInput
                    value={editValue}
                    onChangeText={setEditValue}
                    style={styles.editInput}
                    autoFocus
                  />
                  <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
                    <Text style={{ color: '#fff' }}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.tagText}>{item}</Text>
                  <TouchableOpacity onPress={() => startEdit(index)} style={styles.editBtn}>
                    <Text style={{ color: '#fff', fontSize: 18 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => startDelete(index)} style={styles.deleteBtn}>
                    <Text style={{ color: '#fff', fontSize: 18 }}>🗑️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center' }}>No tags yet.</Text>}
        />
      )}
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 28, color: '#fff' }}>+</Text>
      </TouchableOpacity>
      {/* Add Tag Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Add New Tag</Text>
            <TextInput
              placeholder="Tag name"
              value={newTag}
              onChangeText={setNewTag}
              style={styles.input}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addTag} style={styles.saveBtn}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        visible={confirmDeleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Delete Tag?</Text>
            <Text style={{ marginBottom: 16 }}>
              Are you sure you want to delete this tag?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#fff', fontSize: 18 }}>✖️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
                <Text style={{ color: 'green', fontSize: 18 }}>✅</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  tagText: {
    flex: 1,
    fontSize: 16,
  },
  editBtn: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: '#4caf50',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  deleteBtn: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
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
    width: 300,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
});
