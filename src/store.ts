import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'Super Admin' | 'Admin' | 'Sales' | 'Inventory Manager';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  photoUrl?: string;
  aadhaarUrl?: string;
}

export interface Batch {
  id: string;
  purchaseId: string;
  productId: string;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
  expiryDate?: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitType: 'ml' | 'unit';
  industryPrice: number;
  sellingPrice: number;
  gainPerUnit: number;
  marginPercentage: number;
  status: 'Active' | 'Inactive';
}

export interface DailyStock {
  id: string;
  date: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  openedBy: string;
  closedAt?: string;
  closedBy?: string;
  openingValuation: number;
  closingValuation?: number;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  paymentBreakdown: {
    cash: number;
    qr: number;
    card: number;
  };
}

export interface SaleItem {
  productId: string;
  batchId: string; // Specific batch sold from (FIFO)
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Cost of the batch at time of sale
  total: number;
  profit: number;
}

export interface Sale {
  id: string;
  dailyStockId: string;
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  timestamp: string;
  processedBy: string;
}

export interface Purchase {
  id: string;
  dailyStockId: string;
  productId: string;
  invoiceNumber: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  timestamp: string;
}

export interface Expense {
  id: string;
  dailyStockId: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  timestamp: string;
  details?: string;
}

interface ERPState {
  currentUser: User | null;
  users: User[];
  dailyStocks: DailyStock[];
  products: Product[];
  batches: Batch[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  settings: {
    theme: 'dark' | 'light';
    primaryColor: string;
    shopName: string;
    isSidebarCollapsed: boolean;
  };
  
  // Auth
  login: (username: string) => void;
  logout: () => void;
  
  // Operational Cycle
  openDay: (userId: string) => void;
  closeDay: (userId: string) => void;
  
  // Core Actions
  addProduct: (product: Omit<Product, 'id' | 'gainPerUnit' | 'marginPercentage'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addMember: (user: Omit<User, 'id'>) => void;
  updateMember: (id: string, updates: Partial<User>) => void;
  deleteMember: (id: string) => void;
  
  addPurchase: (purchase: Omit<Purchase, 'id' | 'timestamp' | 'totalAmount' | 'dailyStockId'>) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  processSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'dailyStockId' | 'items' | 'totalAmount' | 'totalProfit'>, cartItems: { productId: string, quantity: number }[]) => void;
  recordManualSale: (amount: number, paymentMethod: 'Cash' | 'QR' | 'Card', details?: string) => void;
  updateStockManually: (productId: string, newQuantity: number, reason: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'dailyStockId'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  logAction: (userId: string, action: string, module: string, details?: string) => void;
  updateSettings: (updates: Partial<ERPState['settings']>) => void;
  toggleSidebar: () => void;
}

export const useStore = create<ERPState>()(
  persist(
    (set, get) => ({
      currentUser: { id: '1', name: 'Super Admin', role: 'Super Admin', email: 'admin@workdesk.com', phone: '0000000000' },
      users: [
        { id: '1', name: 'Super Admin', role: 'Super Admin', email: 'admin@workdesk.com', phone: '0000000000' }
      ],
      dailyStocks: [],
      products: [],
      batches: [],
      sales: [],
      purchases: [],
      expenses: [],
      auditLogs: [],
      settings: {
        theme: 'dark',
        primaryColor: '#22D3EE',
        shopName: 'WORKDESK CENTRAL',
        isSidebarCollapsed: false,
      },

      login: (email) => {
        const user = get().users.find(u => u.email === email);
        if (user) {
          set({ currentUser: user });
          get().logAction(user.id, 'Logged In', 'Auth');
        }
      },
      
      logout: () => {
        const user = get().currentUser;
        if (user) get().logAction(user.id, 'Logged Out', 'Auth');
        set({ currentUser: null });
      },

      openDay: (userId) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (active) return;

        const valuation = get().batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0);
        const newDay: DailyStock = {
          id: `DAY-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          status: 'OPEN',
          openedAt: new Date().toISOString(),
          openedBy: userId,
          openingValuation: valuation,
          totalSales: 0,
          totalPurchases: 0,
          totalExpenses: 0,
          paymentBreakdown: { cash: 0, qr: 0, card: 0 }
        };
        set(state => ({ dailyStocks: [newDay, ...state.dailyStocks] }));
        get().logAction(userId, 'Opened Day', 'Operational');
      },

      closeDay: (userId) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) return;

        const valuation = get().batches.reduce((acc, b) => acc + (b.currentQuantity * b.unitCost), 0);
        set(state => ({
          dailyStocks: state.dailyStocks.map(d => 
            d.id === active.id 
              ? { ...d, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy: userId, closingValuation: valuation }
              : d
          )
        }));
        get().logAction(userId, 'Closed Day', 'Operational');
      },

      addProduct: (p) => {
        const gain = p.sellingPrice - p.industryPrice;
        const margin = (gain / p.sellingPrice) * 100;
        const newProduct: Product = { 
          ...p, 
          id: `PROD-${Date.now()}`,
          gainPerUnit: gain,
          marginPercentage: margin
        };
        set(state => ({ products: [...state.products, newProduct] }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Product: ${p.name}`, 'Products');
      },

      updateProduct: (id, updates) => {
        set(state => ({
          products: state.products.map(p => {
            if (p.id === id) {
              const updated = { ...p, ...updates };
              const gain = updated.sellingPrice - updated.industryPrice;
              const margin = (gain / updated.sellingPrice) * 100;
              return { ...updated, gainPerUnit: gain, marginPercentage: margin };
            }
            return p;
          })
        }));
      },

      deleteProduct: (id) => {
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
      },

      addMember: (user) => {
        const newUser = { ...user, id: `USER-${Date.now()}` };
        set(state => ({ users: [...state.users, newUser] }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Member: ${user.name}`, 'Members');
      },

      updateMember: (id, updates) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Updated Member: ${id}`, 'Members');
      },

      deleteMember: (id) => {
        const userToDelete = get().users.find(u => u.id === id);
        set(state => ({ users: state.users.filter(u => u.id !== id) }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Deleted Member: ${userToDelete?.name || id}`, 'Members');
      },

      addPurchase: (pData) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to record purchases');

        const total = pData.quantity * pData.unitCost;
        const purchase: Purchase = {
          ...pData,
          id: `PUR-${Date.now()}`,
          dailyStockId: active.id,
          totalAmount: total,
          timestamp: new Date().toISOString()
        };

        const batch: Batch = {
          id: `BATCH-${Date.now()}`,
          purchaseId: purchase.id,
          productId: pData.productId,
          initialQuantity: pData.quantity,
          currentQuantity: pData.quantity,
          unitCost: pData.unitCost,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          purchases: [purchase, ...state.purchases],
          batches: [batch, ...state.batches],
          dailyStocks: state.dailyStocks.map(d => d.id === active.id ? { ...d, totalPurchases: d.totalPurchases + total } : d)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Purchase: Inv #${pData.invoiceNumber}`, 'Purchases');
      },

      updatePurchase: (id, updates) => {
        set(state => ({
          purchases: state.purchases.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Updated Purchase: ${id}`, 'Purchases');
      },

      deletePurchase: (id) => {
        const pToDelete = get().purchases.find(p => p.id === id);
        set(state => ({
          purchases: state.purchases.filter(p => p.id !== id),
          batches: state.batches.filter(b => b.purchaseId !== id)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Deleted Purchase: Inv #${pToDelete?.invoiceNumber || id}`, 'Purchases');
      },

      processSale: (saleData, cartItems) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to process sales');

        const newBatches = [...get().batches];
        const soldItems: SaleItem[] = [];
        let totalAmount = 0;
        let totalProfit = 0;

        cartItems.forEach(cartItem => {
          const product = get().products.find(p => p.id === cartItem.productId);
          if (!product) return;

          let remainingToSell = cartItem.quantity;
          
          // FIFO Logic
          const productBatches = newBatches
            .filter(b => b.productId === cartItem.productId && b.currentQuantity > 0)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          const availableStock = productBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
          if (availableStock < remainingToSell) throw new Error(`Insufficient stock for ${product.name}`);

          productBatches.forEach(batch => {
            if (remainingToSell <= 0) return;

            const batchIdInFullList = newBatches.findIndex(b => b.id === batch.id);
            const sellFromThisBatch = Math.min(batch.currentQuantity, remainingToSell);
            
            const itemTotal = sellFromThisBatch * product.sellingPrice;
            const itemCost = sellFromThisBatch * batch.unitCost;
            const itemProfit = itemTotal - itemCost;

            soldItems.push({
              productId: product.id,
              batchId: batch.id,
              name: product.name,
              quantity: sellFromThisBatch,
              unitPrice: product.sellingPrice,
              unitCost: batch.unitCost,
              total: itemTotal,
              profit: itemProfit
            });

            newBatches[batchIdInFullList].currentQuantity -= sellFromThisBatch;
            remainingToSell -= sellFromThisBatch;
            totalAmount += itemTotal;
            totalProfit += itemProfit;
          });
        });

        const sale: Sale = {
          ...saleData,
          id: `SALE-${Date.now()}`,
          dailyStockId: active.id,
          items: soldItems,
          totalAmount,
          totalProfit,
          timestamp: new Date().toISOString()
        };

        const payMethod = saleData.paymentMethod.toLowerCase() as 'cash' | 'qr' | 'card';

        set(state => ({
          sales: [sale, ...state.sales],
          batches: newBatches,
          dailyStocks: state.dailyStocks.map(d => 
            d.id === active.id 
              ? { 
                  ...d, 
                  totalSales: d.totalSales + totalAmount, 
                  paymentBreakdown: { ...d.paymentBreakdown, [payMethod]: d.paymentBreakdown[payMethod] + totalAmount } 
                } 
              : d
          )
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Processed Sale: ₹${totalAmount}`, 'Billing');
      },

      recordManualSale: (amount, paymentMethod, details) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to record sales');

        const sale: Sale = {
          id: `MANUAL-${Date.now()}`,
          dailyStockId: active.id,
          items: [],
          totalAmount: amount,
          totalProfit: amount * 0.2, // Arbitrary 20% margin for manual entry
          paymentMethod,
          timestamp: new Date().toISOString(),
          processedBy: get().currentUser?.id || 'System'
        };

        const payMethod = paymentMethod.toLowerCase() as 'cash' | 'qr' | 'card';

        set(state => ({
          sales: [sale, ...state.sales],
          dailyStocks: state.dailyStocks.map(d => 
            d.id === active.id 
              ? { 
                  ...d, 
                  totalSales: d.totalSales + amount, 
                  paymentBreakdown: { ...d.paymentBreakdown, [payMethod]: d.paymentBreakdown[payMethod] + amount } 
                } 
              : d
          )
        }));
        if (get().currentUser) {
          get().logAction(get().currentUser!.id, `Manual Sale Recorded: ₹${amount}`, 'Billing', details);
        }
      },

      updateStockManually: (productId, newQuantity, reason) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) throw new Error('Product not found');

        const currentBatches = [...get().batches];
        const productBatches = currentBatches
          .filter(b => b.productId === productId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (productBatches.length === 0) {
          // If no batches exist, create a manual adjustment batch
          const newBatch: Batch = {
            id: `MANUAL-BATCH-${Date.now()}`,
            productId,
            purchaseId: 'MANUAL',
            initialQuantity: newQuantity,
            currentQuantity: newQuantity,
            unitCost: product.industryPrice,
            timestamp: new Date().toISOString()
          };
          set(state => ({
            batches: [newBatch, ...state.batches]
          }));
        } else {
          // Update the most recent batch
          const mostRecentBatchId = productBatches[0].id;
          set(state => ({
            batches: state.batches.map(b => 
              b.id === mostRecentBatchId 
                ? { ...b, currentQuantity: newQuantity } 
                : b
            )
          }));
        }

        if (get().currentUser) {
          get().logAction(get().currentUser!.id, `Manual Stock Update: ${productId}`, 'Inventory', `New Qty: ${newQuantity}, Reason: ${reason}`);
        }
      },

      addExpense: (eData) => {
        const active = get().dailyStocks.find(d => d.status === 'OPEN');
        if (!active) throw new Error('Day must be open to record expenses');

        const expense: Expense = {
          ...eData,
          id: `EXP-${Date.now()}`,
          dailyStockId: active.id,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          expenses: [expense, ...state.expenses],
          dailyStocks: state.dailyStocks.map(d => d.id === active.id ? { ...d, totalExpenses: d.totalExpenses + eData.amount } : d)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Added Expense: ${eData.description}`, 'Expenses');
      },

      updateExpense: (id, updates) => {
        set(state => ({
          expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Updated Expense: ${id}`, 'Expenses');
      },

      deleteExpense: (id) => {
        const eToDelete = get().expenses.find(e => e.id === id);
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id)
        }));
        if (get().currentUser) get().logAction(get().currentUser!.id, `Deleted Expense: ${eToDelete?.description || id}`, 'Expenses');
      },

      logAction: (userId, action, module, details) => {
        const log: AuditLog = {
          id: `LOG-${Date.now()}`,
          userId,
          action,
          module,
          details,
          timestamp: new Date().toISOString()
        };
        set(state => ({ auditLogs: [log, ...state.auditLogs] }));
      },

      updateSettings: (updates) => {
        set(state => ({ settings: { ...state.settings, ...updates } }));
      },

      toggleSidebar: () => {
        set(state => ({ settings: { ...state.settings, isSidebarCollapsed: !state.settings.isSidebarCollapsed } }));
      }
    }),
    { name: 'workdesk-erp-storage' }
  )
);
