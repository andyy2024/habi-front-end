export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  account?: Account;
}

export interface Account {
  id: string;
  userId: string;
  balance: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number | string;
  type: 'DEPOSIT' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  senderId?: string;
  receiverId?: string;
  description?: string;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
}

export interface CreateDepositDto {
  accountId: string;
  amount: number;
}

export interface CreateTransferDto {
  senderId: string;
  receiverId: string;
  amount: number;
  description?: string;
}
