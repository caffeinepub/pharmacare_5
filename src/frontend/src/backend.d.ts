import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SaleItem {
    quantity: bigint;
    unitPrice: number;
    medicineId: string;
    medicineName: string;
}
export interface Medicine {
    id: string;
    manufacturer: string;
    expiryDate: bigint;
    name: string;
    isActive: boolean;
    batchNumber: string;
    genericName: string;
    quantity: bigint;
    category: string;
    unitPrice: number;
    reorderLevel: bigint;
}
export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    isActive: boolean;
    email: string;
    address: string;
    phone: string;
}
export interface Sale {
    id: string;
    customerName: string;
    totalAmount: number;
    timestamp: bigint;
    items: Array<SaleItem>;
}
export interface Category {
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string, description: string): Promise<void>;
    addMedicine(name: string, genericName: string, category: string, manufacturer: string, batchNumber: string, expiryDate: bigint, quantity: bigint, unitPrice: number, reorderLevel: bigint): Promise<string>;
    addSupplier(name: string, contactPerson: string, phone: string, email: string, address: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSale(customerName: string, items: Array<SaleItem>, totalAmount: number): Promise<string>;
    deleteCategory(name: string): Promise<void>;
    deleteMedicine(id: string): Promise<void>;
    deleteSupplier(id: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllMedicines(): Promise<Array<Medicine>>;
    getAllSales(): Promise<Array<Sale>>;
    getAllSuppliers(): Promise<Array<Supplier>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(name: string): Promise<Category>;
    getDashboardStats(): Promise<{
        lowStockCount: bigint;
        totalMedicines: bigint;
        totalCategories: bigint;
        expiringSoonCount: bigint;
    }>;
    getExpiringMedicines(daysFromNow: bigint): Promise<Array<Medicine>>;
    getLowStockMedicines(): Promise<Array<Medicine>>;
    getMedicine(_id: string): Promise<Medicine>;
    getSale(_id: string): Promise<Sale>;
    getSalesByDateRange(startDate: bigint, endDate: bigint): Promise<Array<Sale>>;
    getSupplier(_id: string): Promise<Supplier>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMedicines(searchTerm: string): Promise<Array<Medicine>>;
    updateCategory(name: string, description: string): Promise<void>;
    updateMedicine(id: string, name: string, genericName: string, category: string, manufacturer: string, batchNumber: string, expiryDate: bigint, quantity: bigint, unitPrice: number, reorderLevel: bigint, isActive: boolean): Promise<void>;
    updateSupplier(id: string, name: string, contactPerson: string, phone: string, email: string, address: string, isActive: boolean): Promise<void>;
}
