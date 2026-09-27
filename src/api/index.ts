import type { CreateDepositDto, CreateTransferDto, CreateUserDto, Transaction, User } from '../types';

const API_URL = import.meta.env.VITE_BACK_URL 
  ? (import.meta.env.VITE_BACK_URL.startsWith('http') ? import.meta.env.VITE_BACK_URL : `http://${import.meta.env.VITE_BACK_URL}`)
  : 'http://localhost:3000';

export const api = {
  // Users
  createUser: async (data: CreateUserDto): Promise<User> => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  getUser: async (id: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Accounts
  getBalance: async (accountId: string): Promise<{ balance: number | string }> => {
    const res = await fetch(`${API_URL}/accounts/${accountId}/balance`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  },
  getTransactions: async (accountId: string): Promise<Transaction[]> => {
    const res = await fetch(`${API_URL}/accounts/${accountId}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  // Transactions
  deposit: async (data: CreateDepositDto): Promise<any> => {
    const res = await fetch(`${API_URL}/transactions/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to deposit');
    return res.json();
  },
  transfer: async (data: CreateTransferDto): Promise<any> => {
    const res = await fetch(`${API_URL}/transactions/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to transfer');
    return res.json();
  },
};
