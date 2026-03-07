import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Medicine,
  Sale,
  SaleItem,
  Supplier,
  UserProfile,
} from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

export { UserRole };
export type { Medicine, Category, Supplier, Sale, SaleItem, UserProfile };

// ─── Dashboard ──────────────────────────────────────────────
export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Medicines ───────────────────────────────────────────────
export function useMedicines() {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMedicines();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchMedicines(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines", "search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchMedicines(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useLowStockMedicines() {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines", "lowStock"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockMedicines();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpiringMedicines(daysFromNow: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines", "expiring", daysFromNow],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpiringMedicines(BigInt(daysFromNow));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      genericName: string;
      category: string;
      manufacturer: string;
      batchNumber: string;
      expiryDate: bigint;
      quantity: bigint;
      unitPrice: number;
      reorderLevel: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMedicine(
        data.name,
        data.genericName,
        data.category,
        data.manufacturer,
        data.batchNumber,
        data.expiryDate,
        data.quantity,
        data.unitPrice,
        data.reorderLevel,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      genericName: string;
      category: string;
      manufacturer: string;
      batchNumber: string;
      expiryDate: bigint;
      quantity: bigint;
      unitPrice: number;
      reorderLevel: bigint;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMedicine(
        data.id,
        data.name,
        data.genericName,
        data.category,
        data.manufacturer,
        data.batchNumber,
        data.expiryDate,
        data.quantity,
        data.unitPrice,
        data.reorderLevel,
        data.isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMedicine(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────
export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCategory(data.name, data.description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCategory(data.name, data.description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCategory(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── Suppliers ────────────────────────────────────────────────
export function useSuppliers() {
  const { actor, isFetching } = useActor();
  return useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSuppliers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSupplier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      contactPerson: string;
      phone: string;
      email: string;
      address: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSupplier(
        data.name,
        data.contactPerson,
        data.phone,
        data.email,
        data.address,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      contactPerson: string;
      phone: string;
      email: string;
      address: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSupplier(
        data.id,
        data.name,
        data.contactPerson,
        data.phone,
        data.email,
        data.address,
        data.isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSupplier(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

// ─── Sales ────────────────────────────────────────────────────
export function useSales() {
  const { actor, isFetching } = useActor();
  return useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSale() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      customerName: string;
      items: SaleItem[];
      totalAmount: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSale(data.customerName, data.items, data.totalAmount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["medicines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── User Profile ──────────────────────────────────────────────
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["userRole"] });
    },
  });
}
