import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';

interface EditBudgetCardProps {
  visible: boolean;
  onClose: () => void;
  budget: number;
  onSave: (newBudget: number) => void;
}

export default function EditBudgetCard({ visible, onClose, budget, onSave }: EditBudgetCardProps) {
  const [value, setValue] = useState(budget.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      setSaving(true);
      onSave(num);
      setSaving(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBg}>
        <View style={styles.modalContent}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Edit Budget</Text>
          <TextInput
            placeholder="Budget"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }}
          />
          <Button title={saving ? 'Saving...' : 'Save'} onPress={handleSave} disabled={saving} />
          <Button title="Cancel" onPress={onClose} color="#888" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
