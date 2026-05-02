# Liquid Leviathan — Retail ERP: Full Specification

> **Working directory:** `/Users/hubertspencer/Downloads/liquid-leviyathan-v4-final`  
> **Stack:** React + Vite · Zustand (or useStore hook) · Firebase (Firestore + Auth + Storage)  
> **Existing codebase status:** Feature folders are wired up but data is NOT interconnected — all sections read from independent seed/state slices with no cross-section writes.

---

## 0 · Data Interconnection Model (The Root Problem)

The current store has **isolated slices**. The fix is a single propagation chain:

```
Purchase (from supplier)
    └──► Storage entry created  (boughtQty, unitCost, expiryDate, purchaseDate, supplier)
              └──► Billing POS reads Storage for available qty per product per lot
                        └──► Bill completed → Storage.currentQty -= sold qty
                                   └──► Daily Stocks auto-aggregates totals
                                              └──► Dashboard reads Daily Stocks for real KPIs
```

Every **write** that changes money or stock must:
1. Persist to Firestore
2. Write an audit log entry (who, when, what changed, previous value)
3. Trigger the relevant downstream recalculation

---

## 1 · Daily Stocks — The Day Gate (New Section)

> **This section is the operational heartbeat.** Nothing can be recorded until the day is Open. When Closed, the snapshot is frozen and downloadable.

### 1a · Open / Close lifecycle

| State | What is allowed |
|-------|----------------|
| **Closed (default)** | View history only. All "Add" buttons in Billing, Purchases, Expenses are **disabled** with tooltip "Open today's stock first." |
| **Open** | Purchases, Expenses, and Billing are all active. |
| **Closed (by user)** | That day's figures are frozen. PDF can be generated. |

**Open Stock** action:
- Admin must confirm "Opening stock for **[date]**. Yesterday's closing stock is ₹X. Proceed?"
- On confirm: create a `dailyStock` document in Firestore with `{ date, openedBy, openedAt, status:'open', openingStock: <yesterday's closingStock or manual override> }`
- If this is the **first ever** day, ask for a manual opening stock value.

**Close Stock** action:
- Triggered by the "Close Stocks" button in **Billing section** AND a button in Daily Stocks.
- Runs aggregations (see 1b) and writes `closingStock`, `closedBy`, `closedAt`, `status:'closed'`.
- Generates a snapshot document — immutable after close.

### 1b · Daily Stocks summary fields

| Field | Source |
|-------|--------|
| Opening Stock | Previous day's `closingStock` |
| Purchases (received today) | Sum of today's `purchases` where `status='Received'` |
| Expenses | Sum of today's `expenses` amounts |
| Products Sold (revenue) | Sum of today's `bills` totals |
| Received in Cash | Sum of bills where `paymentMode='Cash'` |
| Received in QR / UPI | Sum of bills where `paymentMode='UPI'` |
| Received in Card | Sum of bills where `paymentMode='Card'` |
| Total Revenue | Cash + UPI + Card |
| Closing Stock | OpeningStock + Purchases − Products Sold (at cost) |

### 1c · Daily Stocks UI

- **Top bar:** `[OPEN STOCK]` / `[CLOSE STOCK]` button with current status badge (green/red).
- **Today's summary card:** all 9 fields in a grid with real-time values.
- **PDF Download:** available only when status = `closed`. Uses `jsPDF` or `react-to-print` to export the summary as a branded A4 invoice.
- **History table (bottom):** one row per past day — date, openedBy, closedBy, revenue, closing stock, PDF download icon, audit chevron.
- **Audit log** (bottom, collapsible): who opened, who closed, any manual edits.

---

## 2 · Dashboard

> Financial visualisation. All data derived from real Firestore collections — **no static seed data after MVP**.

### 2a · KPI Cards (row 1)

| Card | Formula |
|------|---------|
| Revenue · Period | Sum of `bills.total` for selected period |
| Net Profit · Period | Revenue − (Expenses + Purchases cost for period) |
| Monthly Salary Bill | Sum of `members.salary` where `status=Active` |
| Total Stock Value | Sum of `storage.currentQty × storage.unitCost` per lot |

### 2b · Charts

- **Area chart:** Revenue / Expenses / Profit over selected period (Day / Week / Month / Year)
- **Bar chart (compare mode):** Current period vs same period last year
- **Expense breakdown bar:** Salary, Purchases/Restock, Other Expenses, Broken/Lost
- **Top 5 items by revenue:** derived from `bills` line items
- **Payment mode pie/donut:** Cash vs UPI vs Card split
- **Monthly breakdown table:** month, revenue, restock, salaries, maintenance, opex, net profit, margin %

### 2c · Data source chain

```
Dashboard ← dailyStocks collection (aggregated)
          ← bills collection (real-time)
          ← expenses collection
          ← purchases collection
          ← members (for salary total)
          ← storage (for stock value)
```

---

## 3 · Billing Section

> POS terminal for customer sales. Every bill deducts stock. Invoice printable. "Close Stocks" button here.

### 3a · Product display rules — **CRITICAL**

> If the **same product** was purchased from supplier at **two different costs** (two purchase lots), they appear as **two separate rows** in the POS, each with their own:
> - `storageId` (links to the specific lot)
> - `unitCost` (cost of that lot)
> - `sellPrice` (set on the product master, but can be overridden per lot in Storage)
> - Stock count from that specific lot

**Example:** "Energy Drink" bought at ₹18/unit (lot A, 300 left) and later at ₹22/unit (lot B, 200 left) → shows as two rows in POS with counts 300 and 200.

### 3b · POS Terminal

- Searchable product list (filtered from `storage` joined with `items`)
- Add to cart: product, qty, sellPrice (auto-filled, editable)
- Cart: qty, unit price, line total, remove button
- Subtotal, discount (₹ or %), total
- Payment mode selector: Cash | UPI | Card
- **[Generate Bill]** button → creates bill, deducts `storage.currentQty`, records audit

### 3c · Invoice / Receipt

- Auto-triggered after bill is created (modal or new tab)
- Shows: shop name, bill number, date/time, cashier name, line items, subtotal, discount, total, payment mode
- **[Print]** button → `window.print()` with print-specific CSS
- **[Save & Close]** → bill is already saved in Firestore; just closes modal

### 3d · Close Stocks Button

- Prominent button in Billing header/actions area
- Calls same `closeDay()` function as Daily Stocks section
- Confirms with: "Close today's stock? This will lock all today's entries."

### 3e · Bill History tab

- Table: Bill No, Date, Cashier, Items (count), Total, Payment Mode, Actions
- Actions: View (re-open receipt modal), Print

### 3f · Audit log (bottom of page)

- All `Billing` section entries from `auditLog` collection
- Shows: timestamp, who, action (Bill created / Bill voided), detail, bill number

---

## 4 · Products (Items)

> Master catalogue. Adding a product here does NOT add stock. Stock comes from Purchases.

### 4a · Table columns

| Column | Detail |
|--------|--------|
| Product Name | With emoji icon |
| Category | Chip/badge |
| Industry Price | What the market charges |
| Sell Price | What shop charges customers |
| Fixed Cost | Base unit cost (not lot-specific) |
| Gain / Unit | `sellPrice − fixedCost` |
| Margin | `((sellPrice − fixedCost) / sellPrice) × 100` % |
| Stock (total) | Sum of `storage.currentQty` for this product across all lots |
| Status | Active / Inactive toggle |
| Actions | Edit · Delete |

### 4b · Add / Edit Product modal

Fields: Name, Emoji, Category, Industry Price, Sell Price, Fixed Cost, Status.  
On save: `gain` and `margin` are computed and stored.

### 4c · Audit log (bottom)

Filters `auditLog` for section = `'Items'`. Shows create / update / delete with previous values and revert button (for price changes).

---

## 5 · Purchases

> Records every supplier purchase. Triggers a Storage entry on receive.

### 5a · Table columns

| DATE | INVOICE | ITEM | SUPPLIER | QTY | UNIT COST | TOTAL | PAYMENT | STATUS |

- **STATUS** values: `Pending` | `Received` | `Cancelled`
- When status changes to `Received`: automatically create/update a `storage` entry with `{ itemId, itemName, supplier, boughtQty: qty, unitCost, boughtTotal: total, purchaseDate: date, expiryDate (from form) }`

### 5b · Add Purchase modal

Fields: Date, Invoice No, Item (dropdown from `items`), Supplier, Qty, Unit Cost (auto-calculates Total), Payment Mode, Expiry Date, Status.

### 5c · Audit log (bottom)

Section = `'Purchases'`. Records: created, status changed, deleted — with previous values.

---

## 6 · Storage

> Visualises product stock lot-by-lot. Each purchase lot is a separate row.

### 6a · Table columns

| Item | Supplier | Lot / Invoice | Bought Qty | Unit Cost | Total Cost | Sell Price | Current Qty | Stock Level bar | Purchase Date | Expiry | Actions |

- **Sell Price** pulled from `items.sellPrice` for that product
- **Current Qty** decrements on each billing sale
- If `currentQty < lowStockThreshold` → warning badge
- If `expiryDate < today` → expired badge (red)
- If `daysUntil(expiryDate) ≤ 60` → expiring soon badge (amber)

### 6b · "Close Stocks" button

Same as Billing — calls `closeDay()`.

### 6c · Recommendations tab

Smart alerts:
- Low stock (< threshold)
- Expiring soon (< 60 days)
- Expired lots

Each has Approve / Reject action. Approved recommendations link through to Purchases section to raise a new purchase order.

### 6d · Audit log (bottom)

Section = `'Storage'`. Records stock additions, manual edits, lot merges.

---

## 7 · Expenses

> All outgoing money that isn't a supplier purchase.

### 7a · Categories

`Salary` | `Utilities` | `Rent` | `Supplies` | `Maintenance / Repair` | `Broken Products` | `Servicing` | `Other`

### 7b · Table columns

| Date | Category | Description | Amount | Paid To | Payment Mode | Added By | Actions |

### 7c · Add Expense modal

Fields: Date, Category, Description, Amount, Paid To, Payment Mode, Notes.  
`addedBy` = currently logged-in user (from Auth).

**Note:** Salary expenses added here link back to Members for monthly salary reporting on Dashboard.

### 7d · Audit log (bottom)

Section = `'Expenses'`. Create / edit / delete with previous values shown.

---

## 8 · Members

> Register and manage all people associated with the shop.

### 8a · Role model

| Role | Access |
|------|--------|
| Super Admin | All sections + Settings + Member management |
| Admin | All sections except Member delete and Settings admin list |
| Sales | Billing only (POS terminal + bill history) |

### 8b · Member form fields

- Full Name
- Phone Number
- Email Address
- Role: `Super Admin` | `Admin` | `Sales` | `Partner` | `Cashier` | `Employee` | `Security` | `Cleaner` | `Delivery`
- Profile Photo — upload with: max 2 MB, types: JPG/PNG
- Aadhaar Document — upload with: max 5 MB, types: PDF/JPG/PNG
- Salary (₹/month)
- Share % (for owners/partners)
- Joined Date
- Status: Active / Inactive

Files stored in Firebase Storage under `members/{memberId}/`.

### 8c · Member card / table

Shows: photo thumbnail, name, role badge, phone, email, status, salary, actions (Edit, Deactivate, Delete).

### 8d · Audit log (bottom)

Section = `'Members'`. Add / edit / deactivate / delete — with who performed the action.

---

## 9 · Settings

### 9a · Options

| Setting | Type |
|---------|------|
| Shop Name | Text input — shown in invoice headers |
| Theme | Toggle: Dark / Light |
| Accent Colour | Colour picker (updates CSS custom property `--accent`) |
| Admin List | Table of users with Admin role — add/remove admin access |
| Low Stock Threshold | Number (default: 50 units) |

---

## 10 · Firestore Collection Schema

```
/items/{itemId}
  name, emoji, category, industryPrice, sellPrice, fixedCost, gain, margin, active
  createdBy, createdAt, updatedBy, updatedAt

/purchases/{purchaseId}
  date, invoiceNo, itemId, itemName, supplier, qty, unitCost, total
  paymentMode, expiryDate, status, createdBy, createdAt, updatedBy, updatedAt

/storage/{lotId}
  itemId, itemName, supplier, purchaseId (ref)
  boughtQty, unitCost, boughtTotal, currentQty
  purchaseDate, expiryDate
  sellPrice (snapshot from items at time of purchase)
  createdBy, createdAt

/bills/{billId}
  billNo, date, cashier (uid + name)
  items: [{ storageId, itemId, itemName, qty, unitCost, sellPrice }]
  subtotal, discount, total, paymentMode
  dailyStockId (ref), createdAt

/expenses/{expenseId}
  date, category, description, amount, paidTo, paymentMode
  addedBy (uid + name), createdAt, updatedAt

/members/{memberId}
  name, phone, email, role, group
  salary, sharePercent, joinedDate, status
  photoUrl, aadhaarUrl
  createdBy, createdAt, updatedBy, updatedAt

/dailyStocks/{date}   ← date as YYYY-MM-DD
  date, status ('open'|'closed')
  openedBy, openedAt, closedBy, closedAt
  openingStock, purchasesTotal, expensesTotal
  productsSoldRevenue, productsSoldCost
  cashReceived, upiReceived, cardReceived, totalRevenue
  closingStock
  pdfUrl (after close)

/auditLog/{logId}
  ts, who (uid + name), section, action, detail
  previousValue (JSON), canRevert, reverted
  linkedDocId (e.g. billId or itemId)

/settings/{shopId}
  shopName, theme, accentColor, lowStockThreshold
  admins: [uid]
```

---

## 11 · Interconnection Rules (Implementation Checklist)

| Trigger | Effect |
|---------|--------|
| Purchase status → `Received` | Create `storage` lot entry |
| Bill created | `storage.currentQty -= qty` for each line item's `storageId` |
| Bill created | Update `dailyStocks.productsSoldRevenue` and `productsSoldCost` |
| Expense added | Update `dailyStocks.expensesTotal` |
| Purchase received | Update `dailyStocks.purchasesTotal` |
| Day Closed | Compute `closingStock`, freeze all today's documents |
| Day Opened | Set `openingStock = yesterday.closingStock` |
| Member added/edited | Salary total on Dashboard updates automatically |
| Item sellPrice changed | Does NOT retroactively change existing storage lots (snapshot model) |
| Storage `currentQty = 0` | Mark lot as exhausted; exclude from POS |

---

## 12 · Key Business Rules

1. **Same product, different cost = different POS row.** A product with 2 purchase lots at different `unitCost` shows as 2 separate sellable rows in the POS terminal. The cashier selects which lot they are selling from.
2. **Billing is gated behind Open Stock.** The `[Generate Bill]` button is disabled if no `dailyStock` document with `status='open'` exists for today.
3. **Purchases trigger Storage.** When a purchase moves to `Received`, a `storage` lot is auto-created — user does not manually add to storage.
4. **Expenses include salary.** Monthly salary for each active member is an expense that should appear in the Expenses section (optionally auto-generated monthly).
5. **Audit logs are immutable.** No delete on `auditLog`. Old entries may be archived after 1 year.
6. **PDF only after close.** Daily Stocks PDF download button is locked until `status='closed'`.
7. **Role gating.** Sales users see only the Billing section. Admin sees all except Member delete. Super Admin has full access.

---

## 13 · What Needs to Change in the Current Codebase

| Area | Current State | Required Change |
|------|--------------|-----------------|
| `useStore.js` | Isolated seed data slices, no cross-slice writes | Replace with Firebase real-time listeners + cross-collection write functions |
| Billing → Storage | `deductStorage` updates local state only | Must write to Firestore `storage` doc + create `auditLog` |
| Purchases | No link to Storage | On status → Received: `addStorage()` auto-called |
| Dashboard | Static `SEED_MONTHLY` data | Derived from `dailyStocks` and live collections |
| `App.jsx` | No `dailyStocks` or `settings` section | Add `dailyStocks` route + section |
| Members | No file upload | Firebase Storage integration for photo + Aadhaar |
| Settings | Exists but empty | Implement shop name, theme, accent, admin list |
| Billing POS | Shows products, not storage lots | Must join `storage` with `items`, show one row per lot |
| Auth | Firebase Auth exists but not enforced in routes | Role-based route guards needed |
| Daily Stocks | **Does not exist** | Full new feature to build |

---

## 14 · Build Priority Order

1. **Daily Stocks feature** (gates everything else)
2. **Firestore interconnection** in `useStore` / service layer
3. **Billing POS** — lot-aware product rows + Close Stocks button
4. **Purchases** → auto-create Storage on Receive
5. **Storage** — read-only from purchases, show lot breakdown
6. **Dashboard** — real data from `dailyStocks` + live collections
7. **Expenses** — with salary category
8. **Members** — file upload
9. **Settings** — shop name, theme, admin list
10. **PDF generation** for Daily Stocks and Bills
