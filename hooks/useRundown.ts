'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RundownItem {
  id: string;
  day: number;
  time: string;
  activity: string;
  note?: string;
  icon: string;
  order: number;
}

export function useRundown() {
  const [items, setItems] = useState<RundownItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRundown = useCallback(async () => {
    try {
      const res = await fetch('/api/rundown');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRundown();
  }, [fetchRundown]);

  const addItem = async (item: Omit<RundownItem, 'id'>) => {
    const res = await fetch('/api/rundown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) fetchRundown();
    return res.ok;
  };

  const updateItem = async (id: string, updates: Partial<RundownItem>) => {
    const res = await fetch('/api/rundown', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) fetchRundown();
    return res.ok;
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/rundown?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) fetchRundown();
    return res.ok;
  };

  return { items, loading, addItem, updateItem, deleteItem, refresh: fetchRundown };
}
