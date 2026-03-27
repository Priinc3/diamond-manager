export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  user_id: string;
}

export interface DiamondType {
  id: string;
  name: string;
  shape?: string;
  size?: string;
  quality?: string;
  description?: string;
  created_at: string;
  user_id: string;
}

export interface MoneyTransaction {
  id: string;
  person_id: string;
  type: 'receivable' | 'payable'; // receivable = they owe me, payable = I owe them
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  user_id: string;
  person?: Person;
}

export interface DiamondTransaction {
  id: string;
  person_id: string;
  diamond_type_id: string;
  type: 'given' | 'received'; // given = they have my diamonds, received = I have theirs
  quantity: number;
  weight?: number;
  description?: string;
  date: string;
  created_at: string;
  user_id: string;
  person?: Person;
  diamond_type?: DiamondType;
}

export interface PersonSummary extends Person {
  total_receivable: number;
  total_payable: number;
  net_balance: number;
  diamonds_given: number;
  diamonds_received: number;
}
