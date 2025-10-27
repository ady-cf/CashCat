import { useState, useEffect } from 'react';
import { getExpenses, saveExpenses } from '../utils/storage';
import { getTagsFromBackend } from '../services/api';

export function useExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await getExpenses();
      setExpenses(stored);
      reloadExpenses();
    })();
  }, []);

  const reloadExpenses = async () => {
    const stored = await getExpenses();
    setExpenses(stored);
  };
  
  // Accept name, description, and optional tags
  const addExpense = async (name: string, amount: number, recurring: boolean, tags?: string[], description?: string, recurringDate?: string) => {
    let usedTags = tags;
    if (!usedTags || usedTags.length === 0) {
      usedTags = await getTagsFromBackend(description || name, amount);
    }
    const now = new Date().toISOString();
    const newExpense = {
      id: Date.now(),
      name,
      description: description || '',
      amount,
      recurring,
      tags: usedTags,
      ...(recurring ? { recurringDate } : { date: now })
    };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    await saveExpenses(updated);
  };

  return { expenses, addExpense , reloadExpenses };
}
