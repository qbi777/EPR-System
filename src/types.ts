export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
}

export interface Permission {
  id: string;
  name: string;
  enabled: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[]; // List of permission IDs
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  purchasePrice: number;
  openingStock: number;
  purchased: number;
  sold: number;
  closingStock: number;
  category: string;
}

export interface POSItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export enum PaymentMethod {
  CASH = 'CASH',
  QR = 'QR',
  CARD = 'CARD',
}

export interface Sale {
  id: string;
  items: POSItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  qrAmount: number;
  cardAmount: number;
  date: string;
  customerName?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  date: string;
}

export interface DaySummary {
  id: string;
  date: string;
  isStarted?: boolean;
  isClosed: boolean;
  openingStockValue: number;
  purchaseAmount: number;
  closingStockValue: number;
  salesAmount: number;
  scanPayAmount: number;
  cardPayAmount: number;
  expensesAmount: number;
  cashAmount: number;
  profit: number;
  startTime: string;
  endTime?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CLOSE_DAY' | 'SALE';
  entity: 'PRODUCT' | 'SALE' | 'EXPENSE' | 'PURCHASE' | 'SETTINGS' | 'USER';
  details: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  role: string; // Dynamic role ID
  phone: string;
  email: string;
  username: string;
  avatar?: string;
  documents: {
    name: string;
    type: string;
    url: string;
  }[];
}

export interface CompanySettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  gstin?: string;
}

export interface AppSettings {
  theme: 'midnight' | 'ocean' | 'forest' | 'ember' | 'slate';
  darkMode: boolean;
  language: 'en' | 'ta';
}
