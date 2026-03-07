# Pharmacy Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Dashboard**: Overview stats (total medicines, low stock alerts, expiring soon, total sales today)
- **Medicine Inventory**: Add, edit, delete medicines with fields: name, generic name, category, manufacturer, batch number, expiry date, quantity in stock, unit price, reorder level
- **Categories**: Manage medicine categories (e.g., Antibiotics, Analgesics, Vitamins, etc.)
- **Suppliers**: Manage supplier records (name, contact, address, medicines supplied)
- **Sales / Billing**: Create a new sale by selecting medicines and quantities, calculate total, record customer name
- **Sales History**: View past sales with date, customer, items, and total amount
- **Low Stock Alerts**: List of medicines below reorder level
- **Expiry Tracker**: List of medicines expiring within 30/60/90 days
- **Authorization**: Role-based access (Admin, Pharmacist)

### Modify
None.

### Remove
None.

## Implementation Plan
1. Select `authorization` component for role-based access control
2. Generate Motoko backend with:
   - Medicine CRUD (id, name, genericName, category, manufacturer, batchNumber, expiryDate, quantity, unitPrice, reorderLevel)
   - Category CRUD
   - Supplier CRUD
   - Sale creation and listing (saleId, customerId/name, items[], totalAmount, timestamp)
   - Query: low stock medicines (quantity <= reorderLevel)
   - Query: expiring medicines (within N days)
   - Dashboard stats query
3. Build React frontend with:
   - Sidebar navigation (Dashboard, Inventory, Categories, Suppliers, Sales, Alerts)
   - Dashboard page with stat cards and quick alerts
   - Inventory management page with table, add/edit modal, search/filter
   - Category management page
   - Supplier management page
   - New Sale / Billing page with medicine selector and receipt
   - Sales history page with table
   - Low stock & expiry alerts pages
   - Login/auth pages
