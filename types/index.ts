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

export type PaymentStatus = 'pending' | 'dp' | 'savings' | 'completed';

export interface MemberWithStatus extends Member {
  total_paid: number;
  remaining: number;
  status: PaymentStatus;
}

export interface VillaPolling {
  id: string;
  name: string;
  imageUrls: string[];
  capacity: number;
  facilities: string[];
  description?: string;
  price: number;
  link?: string;
  locationLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PollingInput = Omit<VillaPolling, 'id' | 'createdAt' | 'updatedAt'>;

export interface Vote {
  id: string;
  memberId: string;
  villaId: string;
  createdAt: string;
  member?: {
    id: string;
    name: string;
  };
}
