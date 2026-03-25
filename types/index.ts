export interface Payment {
  id: string;
  member_id: string;
  type: 'dp' | 'savings' | 'full';
  amount: number;
  date: string;
  note?: string;
  proof?: string; // URL/link bukti pembayaran
  created_at?: string;
}

export interface Member {
  id: string;
  name: string;
  phone?: string;
  target_amount: number;
  dp_amount: number;
  dp_paid: boolean;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'dp_only' | 'savings' | 'completed';

export interface MemberWithStatus extends Member {
  total_paid: number;
  remaining: number;
  status: PaymentStatus;
}
