'use client';

import { useState, useEffect } from 'react';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'villa' | 'transport' | 'konsumsi' | 'lainnya';
  date: string;
}

const STORAGE_KEY = 'villa_trip_actual_expenses_v1';

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, loaded]);

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      category: 'lainnya',
      date: new Date().toISOString().split('T')[0],
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, totalSpent, addExpense, updateExpense, deleteExpense, loaded };
}
