import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, Sale, Expense, Purchase, DaySummary, User, 
  UserRole, CompanySettings, AppSettings, PaymentMethod, AuditLog 
} from '../types';
import { generateId, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface StoreState {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  purchases: Purchase[];
  daySummaries: DaySummary[];
  users: User[];
  roles: UserRole[];
  company: CompanySettings;
  settings: AppSettings;
  currentUser: User | null;
  auditLogs: AuditLog[];
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

interface StoreContextType extends StoreState {
  addProduct: (product: Omit<Product, 'id' | 'closingStock'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'date'>) => void;
  startDay: () => void;
  closeDay: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateCompany: (updates: Partial<CompanySettings>) => void;
  setCurrentUser: (user: User | null) => void;
  deleteProduct: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'documents'>) => void;
  removeUser: (id: string) => void;
  resetStore: () => void;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_ROLES: UserRole[] = [
  { id: 'admin', name: 'Administrator', permissions: ['all'] },
  { id: 'manager', name: 'Store Manager', permissions: ['dashboard', 'inventory', 'pos', 'expenses'] },
  { id: 'sales', name: 'Sales Executive', permissions: ['pos', 'dashboard'] },
];

const INITIAL_COMPANY: CompanySettings = {
  name: 'My Store',
  logo: '',
  address: '',
  phone: '',
};

const INITIAL_SETTINGS: AppSettings = {
  theme: 'midnight',
  darkMode: true,
  language: 'en',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [daySummaries, setDaySummaries] = useState<DaySummary[]>([]);
  const [company, setCompany] = useState<CompanySettings>(INITIAL_COMPANY);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles] = useState<UserRole[]>(INITIAL_ROLES);

  // Validate Connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'config', 'connection_test'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth & Unified Data Loader
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      if (!fUser) {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribers: (() => void)[] = [];

    const syncCollection = (path: string, setter: (data: any[]) => void, orderField?: string) => {
      const q = orderField ? query(collection(db, path), orderBy(orderField, 'desc')) : collection(db, path);
      const unsub = onSnapshot(q, async (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id }));
        setter(data);
        
        // Handle current user sync
        if (path === 'users') {
          const SUPER_ADMINS = ['leviyathanindustries@gmail.com', 'dayzer0to1.official@gmail.com'];
          const localUser = data.find(u => u.email === firebaseUser.email || u.id === firebaseUser.uid);
          
          if (localUser) {
            setCurrentUser(localUser);
          } else if (SUPER_ADMINS.includes(firebaseUser.email || '')) {
             // Provides a fallback admin profile if not yet in the DB
             setCurrentUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Administrator',
                email: firebaseUser.email || '',
                role: 'admin',
                phone: '',
                username: 'admin',
                documents: []
             });
          } else {
            // Default "Guest" or "Unauthorized" state - in a real app we might redirect to a 'waiting' page
            setCurrentUser(null);
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      unsubscribers.push(unsub);
    };

    const syncDoc = (path: string, setter: (data: any) => void) => {
      const unsub = onSnapshot(doc(db, path), (snapshot) => {
        if (snapshot.exists()) {
          setter(snapshot.data());
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
      unsubscribers.push(unsub);
    };

    syncCollection('products', setProducts, 'name');
    syncCollection('sales', setSales, 'date');
    syncCollection('expenses', setExpenses, 'date');
    syncCollection('purchases', setPurchases, 'date');
    syncCollection('users', setUsers);
    syncCollection('daySummaries', setDaySummaries, 'startTime');
    syncCollection('auditLogs', setAuditLogs, 'timestamp');
    syncDoc('config/app', setSettings);
    syncDoc('config/company', setCompany);

    setLoading(false);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [firebaseUser]);

  const addAuditLog = async (action: AuditLog['action'], entity: AuditLog['entity'], details: string) => {
    if (!currentUser) return;
    
    const majorEntities: AuditLog['entity'][] = ['PRODUCT', 'SALE', 'EXPENSE', 'PURCHASE', 'USER', 'SETTINGS'];
    if (!majorEntities.includes(entity)) return;

    const id = generateId();
    const log: AuditLog = {
      id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      details,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await setDoc(doc(db, 'auditLogs', id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'auditLogs');
    }
  };

  const addProduct = async (p: Omit<Product, 'id' | 'closingStock'>) => {
    const id = generateId();
    const newProduct: Product = {
      ...p,
      id,
      closingStock: p.openingStock + p.purchased - p.sold
    };
    try {
      await setDoc(doc(db, 'products', id), newProduct);
      addAuditLog('CREATE', 'PRODUCT', `Added new product: ${p.name} (SKU: ${p.sku})`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const updated = { ...product, ...updates };
    updated.closingStock = updated.openingStock + updated.purchased - updated.sold;

    try {
      await updateDoc(doc(db, 'products', id), updated);
      const changedKeys = Object.keys(updates).join(', ');
      addAuditLog('UPDATE', 'PRODUCT', `Updated product: ${product.name} (Changed: ${changedKeys})`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    try {
      await deleteDoc(doc(db, 'products', id));
      if (product) {
        addAuditLog('DELETE', 'PRODUCT', `Deleted product: ${product.name} (ID: ${id})`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'products');
    }
  };

  const addUser = async (u: Omit<User, 'id' | 'documents'>) => {
    const id = generateId();
    const newUser: User = {
      ...u,
      id,
      documents: []
    };
    try {
      await setDoc(doc(db, 'users', id), newUser);
      addAuditLog('CREATE', 'USER', `Registered new team member: ${u.name} (${u.role})`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const removeUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.email === 'leviyathanindustries@gmail.com') {
      alert("Cannot delete the Super Admin!");
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', id));
      if (user) {
        addAuditLog('DELETE', 'USER', `Removed team member: ${user.name}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'users');
    }
  };

  const addSale = async (s: Omit<Sale, 'id' | 'date'>) => {
    const activeSession = daySummaries.find(d => d.isStarted && !d.isClosed);
    if (!activeSession) {
      alert("Cannot add sale. No active session! Please start a session first.");
      return;
    }

    const id = generateId();
    const newSale: Sale = {
      ...s,
      id,
      date: new Date().toISOString(),
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'sales', id), newSale);
      
      // Update product stock in same batch
      s.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const updatedSold = product.sold + item.quantity;
          const updatedClosing = product.openingStock + product.purchased - updatedSold;
          batch.update(doc(db, 'products', product.id), { 
            sold: updatedSold,
            closingStock: updatedClosing
          });
        }
      });

      await batch.commit();
      addAuditLog('CREATE', 'SALE', `Generated new sale: ${id} (Amount: ${newSale.totalAmount})`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sales/batch');
    }
  };

  const addExpense = async (e: Omit<Expense, 'id' | 'date'>) => {
    const activeSession = daySummaries.find(d => d.isStarted && !d.isClosed);
    if (!activeSession) {
      alert("Cannot add expense. No active session!");
      return;
    }

    const id = generateId();
    const newExpense: Expense = {
      ...e,
      id,
      date: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'expenses', id), newExpense);
      addAuditLog('CREATE', 'EXPENSE', `Logged expense: ${e.category} (Amount: ${e.amount})`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'expenses');
    }
  };

  const addPurchase = async (p: Omit<Purchase, 'id' | 'date'>) => {
    const activeSession = daySummaries.find(d => d.isStarted && !d.isClosed);
    if (!activeSession) {
      alert("Cannot add purchase. No active session!");
      return;
    }

    const id = generateId();
    const newPurchase: Purchase = {
      ...p,
      id,
      date: new Date().toISOString(),
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'purchases', id), newPurchase);
      
      const product = products.find(prod => prod.id === p.productId);
      if (product) {
        const updatedPurchased = product.purchased + p.quantity;
        const updatedClosing = product.openingStock + updatedPurchased - product.sold;
        batch.update(doc(db, 'products', product.id), { 
          purchased: updatedPurchased,
          closingStock: updatedClosing
        });
      }

      await batch.commit();
      addAuditLog('CREATE', 'PURCHASE', `Added purchase for productId: ${p.productId} (Qty: ${p.quantity})`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'purchases/batch');
    }
  };

  const startDay = async () => {
    const activeSession = daySummaries.find(d => d.isStarted && !d.isClosed);
    if (activeSession) {
      alert("A session is already active!");
      return;
    }

    const id = generateId();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const openingValue = products.reduce((acc, curr) => acc + curr.openingStock * curr.purchasePrice, 0);
    
    const summary: DaySummary = {
      id,
      date: todayStr,
      isStarted: true,
      isClosed: false,
      openingStockValue: openingValue,
      purchaseAmount: 0,
      closingStockValue: openingValue,
      salesAmount: 0,
      scanPayAmount: 0,
      cardPayAmount: 0,
      expensesAmount: 0,
      cashAmount: 0,
      profit: 0,
      startTime: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'daySummaries', id), summary);
      addAuditLog('SALE', 'SALE', `Started workday session for ${todayStr}. Opening Stock: ${formatCurrency(openingValue)}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'daySummaries');
    }
  };

  const closeDay = async () => {
    const activeSession = daySummaries.find(d => d.isStarted && !d.isClosed);
    if (!activeSession) return;

    const sessionStart = new Date(activeSession.startTime);
    const sessionSales = sales.filter(s => new Date(s.date) >= sessionStart);
    const sessionExpenses = expenses.filter(e => new Date(e.date) >= sessionStart);
    const sessionPurchases = purchases.filter(p => new Date(p.date) >= sessionStart);

    const totalSold = sessionSales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalExpenses = sessionExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPurchased = sessionPurchases.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
    
    const cash = sessionSales.reduce((acc, curr) => acc + (curr.cashAmount || 0), 0);
    const scan = sessionSales.reduce((acc, curr) => acc + (curr.qrAmount || 0), 0);
    const card = sessionSales.reduce((acc, curr) => acc + (curr.cardAmount || 0), 0);

    const closingValue = products.reduce((acc, curr) => acc + curr.closingStock * curr.purchasePrice, 0);
    const cogs = (activeSession.openingStockValue + totalPurchased) - closingValue;
    const profit = totalSold - cogs - totalExpenses;

    const updatedSummary: DaySummary = {
      ...activeSession,
      isClosed: true,
      endTime: new Date().toISOString(),
      purchaseAmount: totalPurchased,
      closingStockValue: closingValue,
      salesAmount: totalSold,
      scanPayAmount: scan,
      cardPayAmount: card,
      expensesAmount: totalExpenses,
      cashAmount: cash,
      profit: profit,
    };

    try {
      await updateDoc(doc(db, 'daySummaries', activeSession.id), updatedSummary as any);
      addAuditLog('CLOSE_DAY', 'SALE', `Settled session ${activeSession.id}. Total Inflow: ${formatCurrency(totalSold)}, Net Profit: ${formatCurrency(profit)}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'daySummaries');
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      await setDoc(doc(db, 'config', 'app'), { ...settings, ...updates }, { merge: true });
      addAuditLog('UPDATE', 'SETTINGS', `Updated application settings: ${Object.keys(updates).join(', ')}`);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, 'config/app');
    }
  };

  const updateCompany = async (updates: Partial<CompanySettings>) => {
    try {
      await setDoc(doc(db, 'config', 'company'), { ...company, ...updates }, { merge: true });
      addAuditLog('UPDATE', 'SETTINGS', `Updated company profile: ${Object.keys(updates).join(', ')}`);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, 'config/company');
    }
  };

  const resetStore = async () => {
    // This is dangerous, maybe only Super Admin can do this by deleting all docs?
    // For now, let's just alert.
    alert("System-wide reset is restricted to the development console.");
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCurrentUser(null);
      // Clean up state
      setProducts([]);
      setSales([]);
      setExpenses([]);
      setPurchases([]);
      setUsers([]);
      setDaySummaries([]);
      setAuditLogs([]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <StoreContext.Provider value={{
      products, sales, expenses, purchases, daySummaries, users, roles, company, settings, currentUser, auditLogs,
      firebaseUser, loading,
      addProduct, updateProduct, deleteProduct, addSale, addExpense, addPurchase, closeDay, startDay,
      updateSettings, updateCompany, setCurrentUser, addUser, removeUser, resetStore, logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
