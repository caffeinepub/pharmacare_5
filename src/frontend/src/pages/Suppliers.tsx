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
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "../hooks/useQueries";
import type { Supplier } from "../hooks/useQueries";
import { sampleSuppliers } from "../lib/sampleData";

type SupplierForm = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
};
const emptyForm = (): SupplierForm => ({
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
});

export default function Suppliers() {
  const { data: suppliersData, isLoading } = useSuppliers();
  const addSup = useAddSupplier();
  const updateSup = useUpdateSupplier();
  const deleteSup = useDeleteSupplier();

  const [showModal, setShowModal] = useState(false);
  const [editSup, setEditSup] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm());

  const suppliers =
    suppliersData && suppliersData.length > 0 ? suppliersData : sampleSuppliers;

  const openAdd = () => {
    setForm(emptyForm());
    setEditSup(null);
    setShowModal(true);
  };
  const openEdit = (sup: Supplier) => {
    setEditSup(sup);
    setForm({
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      isActive: sup.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    try {
      if (editSup) {
        await updateSup.mutateAsync({ id: editSup.id, ...form });
        toast.success("Supplier updated");
      } else {
        await addSup.mutateAsync(form);
        toast.success("Supplier added");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save supplier");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSup.mutateAsync(deletingId);
      toast.success("Supplier deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete supplier");
    }
  };

  const isPending = addSup.isPending || updateSup.isPending;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Suppliers
          </h1>
          <p className="text-muted-foreground text-sm">
            {suppliers.length} suppliers
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="suppliers.add_button"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </motion.div>

      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="suppliers.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
              <TableHead className="font-semibold text-xs">Supplier</TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">
                Contact
              </TableHead>
              <TableHead className="font-semibold text-xs hidden lg:table-cell">
                Address
              </TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => i).map((idx) => (
                <TableRow key={`row-${idx}`} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="suppliers.empty_state"
                >
                  No suppliers yet. Add your first one!
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((sup, idx) => (
                <TableRow
                  key={sup.id}
                  className="border-border"
                  data-ocid={`suppliers.item.${idx + 1}`}
                >
                  <TableCell className="py-3">
                    <div className="font-medium text-sm">{sup.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {sup.contactPerson}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {sup.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" /> {sup.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-[200px]">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{sup.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sup.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {sup.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:text-primary"
                        onClick={() => openEdit(sup)}
                        data-ocid={`suppliers.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:text-destructive"
                        onClick={() => setDeletingId(sup.id)}
                        data-ocid={`suppliers.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          data-ocid={
            editSup
              ? "suppliers.edit_modal.dialog"
              : "suppliers.add_modal.dialog"
          }
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editSup ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
            <DialogDescription>
              {editSup
                ? "Update supplier details."
                : "Add a new medicine supplier."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Supplier Name *</Label>
              <Input
                placeholder="e.g. MediSource Distributors"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="suppliers.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input
                placeholder="Full name"
                value={form.contactPerson}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPerson: e.target.value }))
                }
                data-ocid="suppliers.contact.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                placeholder="+91-XXXXXXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                data-ocid="suppliers.phone.input"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="contact@supplier.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="suppliers.email.input"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Address</Label>
              <Input
                placeholder="Full address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                data-ocid="suppliers.address.input"
              />
            </div>
            {editSup && (
              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                  data-ocid="suppliers.active.switch"
                />
                <Label>Active Supplier</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="suppliers.modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="suppliers.modal.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editSup ? (
                "Update"
              ) : (
                "Add Supplier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent data-ocid="suppliers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Supplier?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this supplier. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="suppliers.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSup.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="suppliers.delete.confirm_button"
            >
              {deleteSup.isPending ? (
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
