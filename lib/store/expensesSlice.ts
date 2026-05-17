'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'villa' | 'transport' | 'konsumsi' | 'lainnya';
  date: string;
}

interface ExpensesState {
  items: ExpenseItem[];
  loading: boolean;
  initialized: boolean;
}

const STORAGE_KEY = 'villa_trip_actual_expenses_v1';

const initialState: ExpensesState = {
  items: [],
  loading: false,
  initialized: false,
};

export const initializeExpenses = createAsyncThunk(
  'expenses/initialize',
  async () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const localData: ExpenseItem[] = JSON.parse(saved);
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
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Migration failed:', e);
      }
    }

    const res = await fetch('/api/expenses');
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return (await res.json()) as ExpenseItem[];
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { expenses: ExpensesState };
      return !state.expenses.loading && !state.expenses.initialized;
    },
  }
);

export const refreshExpenses = createAsyncThunk('expenses/refresh', async () => {
  const res = await fetch('/api/expenses');
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return (await res.json()) as ExpenseItem[];
});

export const createExpense = createAsyncThunk('expenses/create', async (payload: Omit<ExpenseItem, 'id'>) => {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to create expense');
  }

  return (await res.json()) as ExpenseItem;
});

export const editExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, updates }: { id: string; updates: Partial<ExpenseItem> }) => {
    const res = await fetch('/api/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!res.ok) throw new Error('Failed to update expense');
    return { id, updates };
  }
);

export const removeExpense = createAsyncThunk('expenses/delete', async (id: string) => {
  const res = await fetch(`/api/expenses?id=${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete expense');
  return id;
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeExpenses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeExpenses.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
      })
      .addCase(refreshExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshExpenses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(refreshExpenses.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(editExpense.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        );
      })
      .addCase(removeExpense.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default expensesSlice.reducer;
