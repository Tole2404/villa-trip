'use client';

import { useState, useEffect, useCallback } from 'react';

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
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.error('Failed to fetch expenses:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const migrateAndFetch = async () => {
      // 1. Check if there's data in localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const localData: ExpenseItem[] = JSON.parse(saved);
          if (localData.length > 0) {
            console.log('Migrating local expenses to database...');
            // Migrate each local item to DB
            for (const item of localData) {
              await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: item.name || 'Tanpa Nama',
                  amount: item.amount || 0,
                  category: item.category,
                  date: item.date,
                }),
              });
            }
            // Clear localStorage after migration
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          console.error('Migration failed:', e);
        }
      }
      
      // 2. Fetch from DB
      await fetchExpenses();
    };

    migrateAndFetch();
  }, [fetchExpenses]);

  const addExpense = async () => {
    const newExpense = {
      name: '',
      amount: 0,
      category: 'lainnya',
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      if (res.ok) {
        await fetchExpenses();
      } else {
        const errorData = await res.json();
        console.error('API Error details:', errorData);
        alert('Gagal menambah item: ' + (errorData.error || 'Server error'));
      }
    } catch (e) {
      console.error('Network/Fetch failure:', e);
      alert('Gagal menyambung ke server. Cek koneksi internetmu.');
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseItem>) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      }
    } catch (e) {
      console.error('Failed to update expense:', e);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete expense:', e);
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { 
    expenses, 
    totalSpent, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    loading,
    refreshExpenses: fetchExpenses 
  };
}
