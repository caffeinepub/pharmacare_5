import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddMedicine,
  useCategories,
  useDeleteMedicine,
  useMedicines,
  useUpdateMedicine,
} from "../hooks/useQueries";
import type { Medicine } from "../hooks/useQueries";
import {
  dateInputToNs,
  daysUntilExpiry,
  formatCurrency,
  formatDate,
  nsToDateInput,
} from "../lib/dateUtils";
import { sampleCategories, sampleMedicines } from "../lib/sampleData";

type MedicineFormData = {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: string;
  unitPrice: string;
  reorderLevel: string;
  isActive: boolean;
};

const emptyForm = (): MedicineFormData => ({
  name: "",
  genericName: "",
  category: "",
  manufacturer: "",
  batchNumber: "",
  expiryDate: "",
  quantity: "",
  unitPrice: "",
  reorderLevel: "50",
  isActive: true,
});

export default function Inventory() {
  const { data: medicinesData, isLoading } = useMedicines();
  const { data: categoriesData } = useCategories();
  const addMed = useAddMedicine();
  const updateMed = useUpdateMedicine();
  const deleteMed = useDeleteMedicine();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMed, setEditMed] = useState<Medicine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicineFormData>(emptyForm());

  const medicines =
    medicinesData && medicinesData.length > 0 ? medicinesData : sampleMedicines;
  const categories =
    categoriesData && categoriesData.length > 0
      ? categoriesData
      : sampleCategories;

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(emptyForm());
    setShowAddModal(true);
  };
  const openEdit = (med: Medicine) => {
    setEditMed(med);
    setForm({
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      expiryDate: nsToDateInput(med.expiryDate),
      quantity: String(Number(med.quantity)),
      unitPrice: String(med.unitPrice),
      reorderLevel: String(Number(med.reorderLevel)),
      isActive: med.isActive,
    });
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.genericName ||
      !form.category ||
      !form.expiryDate ||
      !form.quantity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const payload = {
      name: form.name,
      genericName: form.genericName,
      category: form.category,
      manufacturer: form.manufacturer,
      batchNumber: form.batchNumber,
      expiryDate: dateInputToNs(form.expiryDate),
      quantity: BigInt(Math.round(Number(form.quantity))),
      unitPrice: Number(form.unitPrice),
      reorderLevel: BigInt(Math.round(Number(form.reorderLevel))),
    };
    try {
      if (editMed) {
        await updateMed.mutateAsync({
          id: editMed.id,
          ...payload,
          isActive: form.isActive,
        });
        toast.success("Medicine updated successfully");
        setEditMed(null);
      } else {
        await addMed.mutateAsync(payload);
        toast.success("Medicine added successfully");
        setShowAddModal(false);
      }
    } catch {
      toast.error("Failed to save medicine. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMed.mutateAsync(deletingId);
      toast.success("Medicine deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete medicine");
    }
  };

  const isPending = addMed.isPending || updateMed.isPending;

  const MedicineModal = ({
    open,
    onClose,
  }: { open: boolean; onClose: () => void }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid={
          editMed ? "medicine.edit_modal.dialog" : "medicine.add_modal.dialog"
        }
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editMed ? "Edit Medicine" : "Add New Medicine"}
          </DialogTitle>
          <DialogDescription>
            {editMed
              ? "Update the medicine details below."
              : "Fill in the details to add a new medicine to inventory."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label>Medicine Name *</Label>
            <Input
              placeholder="e.g. Amoxicillin 500mg"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              data-ocid="medicine.name.input"
            />
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label>Generic Name *</Label>
            <Input
              placeholder="e.g. Amoxicillin"
              value={form.genericName}
              onChange={(e) =>
                setForm((f) => ({ ...f, genericName: e.target.value }))
              }
              data-ocid="medicine.generic_name.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger data-ocid="medicine.category.select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Manufacturer</Label>
            <Input
              placeholder="e.g. Sun Pharma"
              value={form.manufacturer}
              onChange={(e) =>
                setForm((f) => ({ ...f, manufacturer: e.target.value }))
              }
              data-ocid="medicine.manufacturer.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Batch Number</Label>
            <Input
              placeholder="e.g. SUN2025A01"
              value={form.batchNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, batchNumber: e.target.value }))
              }
              data-ocid="medicine.batch.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Expiry Date *</Label>
            <Input
              type="date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiryDate: e.target.value }))
              }
              data-ocid="medicine.expiry.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: e.target.value }))
              }
              data-ocid="medicine.quantity.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit Price (₹)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.unitPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, unitPrice: e.target.value }))
              }
              data-ocid="medicine.price.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reorder Level</Label>
            <Input
              type="number"
              min="0"
              placeholder="50"
              value={form.reorderLevel}
              onChange={(e) =>
                setForm((f) => ({ ...f, reorderLevel: e.target.value }))
              }
              data-ocid="medicine.reorder.input"
            />
          </div>
          {editMed && (
            <div className="space-y-1.5 flex items-center gap-3 pt-5">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                data-ocid="medicine.active.switch"
              />
              <Label>Active</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="medicine.modal.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            data-ocid="medicine.modal.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : editMed ? (
              "Update Medicine"
            ) : (
              "Add Medicine"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Inventory
          </h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} medicines
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="inventory.add_button"
        >
          <Plus className="w-4 h-4" /> Add Medicine
        </Button>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="inventory.search_input"
        />
      </div>

      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="inventory.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
              <TableHead className="font-semibold text-xs">Name</TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs text-right">
                Qty
              </TableHead>
              <TableHead className="font-semibold text-xs text-right hidden lg:table-cell">
                Price
              </TableHead>
              <TableHead className="font-semibold text-xs hidden lg:table-cell">
                Expiry
              </TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => i).map((idx) => (
                <TableRow
                  key={`row-${idx}`}
                  className="border-border"
                  data-ocid="inventory.loading_state"
                >
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="inventory.empty_state"
                >
                  {search
                    ? "No medicines match your search."
                    : "No medicines yet. Add your first one!"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((med, idx) => {
                const isLow = Number(med.quantity) < Number(med.reorderLevel);
                const days = daysUntilExpiry(med.expiryDate);
                const expiryBadge =
                  days <= 0
                    ? "destructive"
                    : days <= 30
                      ? "destructive"
                      : days <= 90
                        ? "secondary"
                        : "outline";
                return (
                  <TableRow
                    key={med.id}
                    className={`border-border ${isLow ? "bg-destructive/5 hover:bg-destructive/8" : ""}`}
                    data-ocid={`inventory.item.${idx + 1}`}
                  >
                    <TableCell className="py-3">
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {isLow && (
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        )}
                        {med.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {med.genericName}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {med.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-mono font-semibold text-sm ${isLow ? "text-destructive" : "text-foreground"}`}
                      >
                        {Number(med.quantity)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell text-sm text-muted-foreground">
                      {formatCurrency(med.unitPrice)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={expiryBadge} className="text-xs">
                        {formatDate(med.expiryDate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={med.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {med.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 hover:text-primary"
                          onClick={() => openEdit(med)}
                          data-ocid={`medicine.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 hover:text-destructive"
                          onClick={() => setDeletingId(med.id)}
                          data-ocid={`medicine.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Modal */}
      <MedicineModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      {/* Edit Modal */}
      <MedicineModal open={!!editMed} onClose={() => setEditMed(null)} />

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent data-ocid="medicine.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Medicine?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The medicine will be permanently
              removed from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="medicine.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMed.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="medicine.delete.confirm_button"
            >
              {deleteMed.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
