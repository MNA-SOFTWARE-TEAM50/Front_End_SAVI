// Tipos globales para SAVI

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  userId: string;
  status: SaleStatus;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export type UserRole = 'admin' | 'cashier' | 'manager';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
