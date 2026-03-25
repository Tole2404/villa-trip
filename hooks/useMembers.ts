'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member, Payment, MemberWithStatus } from '@/types';

export function useMembers() {
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalTarget: 0,
    totalCollected: 0,
    dpCompleted: 0,
    fullyPaid: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data anggota');
      console.error(err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats({
        totalMembers: parseInt(data.total_members) || 0,
        totalTarget: parseInt(data.total_target) || 0,
        totalCollected: parseInt(data.total_collected) || 0,
        dpCompleted: parseInt(data.dp_completed) || 0,
        fullyPaid: parseInt(data.fully_paid) || 0,
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchMembers(), fetchStats()]);
      setLoaded(true);
    };
    load();
  }, [fetchMembers, fetchStats]);

  // Add member
  const addMember = useCallback(async (member: { name: string; phone?: string; targetAmount: number; dpAmount: number }) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (!res.ok) throw new Error('Failed to add member');
      await Promise.all([fetchMembers(), fetchStats()]);
      return true;
    } catch (err) {
      setError('Gagal menambah anggota');
      console.error(err);
      return false;
    }
  }, [fetchMembers, fetchStats]);

  // Update member
  const updateMember = useCallback(async (id: string, updates: Partial<Member>) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update member');
      await fetchMembers();
      return true;
    } catch (err) {
      setError('Gagal update anggota');
      console.error(err);
      return false;
    }
  }, [fetchMembers]);

  // Delete member
  const deleteMember = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete member');
      await Promise.all([fetchMembers(), fetchStats()]);
      return true;
    } catch (err) {
      setError('Gagal hapus anggota');
      console.error(err);
      return false;
    }
  }, [fetchMembers, fetchStats]);

  // Add payment
  const addPayment = useCallback(async (memberId: string, payment: { type: 'dp' | 'savings' | 'full'; amount: number; date: string; note?: string }) => {
    try {
      const res = await fetch(`/api/members/${memberId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      if (!res.ok) throw new Error('Failed to add payment');
      await Promise.all([fetchMembers(), fetchStats()]);
      return true;
    } catch (err) {
      setError('Gagal menambah pembayaran');
      console.error(err);
      return false;
    }
  }, [fetchMembers, fetchStats]);

  // Delete payment
  const deletePayment = useCallback(async (memberId: string, paymentId: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/payments?paymentId=${paymentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete payment');
      await Promise.all([fetchMembers(), fetchStats()]);
      return true;
    } catch (err) {
      setError('Gagal hapus pembayaran');
      console.error(err);
      return false;
    }
  }, [fetchMembers, fetchStats]);

  // Get payments for a member
  const getPayments = useCallback(async (memberId: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/payments`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      return await res.json() as Payment[];
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  return {
    members,
    stats,
    loaded,
    error,
    addMember,
    updateMember,
    deleteMember,
    addPayment,
    deletePayment,
    getPayments,
  };
}
