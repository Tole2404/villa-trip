'use client';

import { useEffect } from 'react';
import {
  createExpense,
  editExpense,
  initializeExpenses,
  refreshExpenses,
  removeExpense,
} from '@/lib/store/expensesSlice';
import { useAppDispatch, useAppSelector } from '@/lib/storeHooks';

export function useExpenses() {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.items);
  const loading = useAppSelector((state) => state.expenses.loading);
  const initialized = useAppSelector((state) => state.expenses.initialized);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeExpenses());
    }
  }, [dispatch, initialized]);

  const addExpense = async () => {
    try {
      await dispatch(
        createExpense({
          name: '',
          amount: 0,
          category: 'lainnya',
          date: new Date().toISOString().split('T')[0],
        })
      ).unwrap();
    } catch (e) {
      console.error('Network/Fetch failure:', e);
      alert(e instanceof Error ? e.message : 'Gagal menyambung ke server. Cek koneksi internetmu.');
    }
  };

  const updateExpense = async (
    id: string,
    updates: Partial<{
      id: string;
      name: string;
      amount: number;
      category: 'villa' | 'transport' | 'konsumsi' | 'lainnya';
      date: string;
    }>
  ) => {
    try {
      await dispatch(editExpense({ id, updates })).unwrap();
    } catch (e) {
      console.error('Failed to update expense:', e);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await dispatch(removeExpense(id)).unwrap();
    } catch (e) {
      console.error('Failed to delete expense:', e);
    }
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  return {
    expenses,
    totalSpent,
    addExpense,
    updateExpense,
    deleteExpense,
    loading,
    refreshExpenses: () => dispatch(refreshExpenses()),
  };
}
