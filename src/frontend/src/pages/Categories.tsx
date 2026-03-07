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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddCategory,
  useCategories,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useQueries";
import type { Category } from "../hooks/useQueries";
import { sampleCategories } from "../lib/sampleData";

export default function Categories() {
  const { data: categoriesData, isLoading } = useCategories();
  const addCat = useAddCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const categories =
    categoriesData && categoriesData.length > 0
      ? categoriesData
      : sampleCategories;

  const openAdd = () => {
    setForm({ name: "", description: "" });
    setEditCat(null);
    setShowModal(true);
  };
  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editCat) {
        await updateCat.mutateAsync({
          name: form.name,
          description: form.description,
        });
        toast.success("Category updated");
      } else {
        await addCat.mutateAsync({
          name: form.name,
          description: form.description,
        });
        toast.success("Category added");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deletingName) return;
    try {
      await deleteCat.mutateAsync(deletingName);
      toast.success("Category deleted");
      setDeletingName(null);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const isPending = addCat.isPending || updateCat.isPending;

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Categories
          </h1>
          <p className="text-muted-foreground text-sm">
            {categories.length} categories
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="categories.add_button"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </motion.div>

      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="categories.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
              <TableHead className="font-semibold text-xs">
                Category Name
              </TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">
                Description
              </TableHead>
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
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="categories.empty_state"
                >
                  No categories yet. Add your first one!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, idx) => (
                <TableRow
                  key={cat.name}
                  className="border-border"
                  data-ocid={`categories.item.${idx + 1}`}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:text-primary"
                        onClick={() => openEdit(cat)}
                        data-ocid={`categories.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:text-destructive"
                        onClick={() => setDeletingName(cat.name)}
                        data-ocid={`categories.delete_button.${idx + 1}`}
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

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          data-ocid={
            editCat
              ? "categories.edit_modal.dialog"
              : "categories.add_modal.dialog"
          }
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editCat
                ? "Update the category details."
                : "Create a new medicine category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category Name *</Label>
              <Input
                placeholder="e.g. Antibiotics"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={!!editCat}
                data-ocid="categories.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this category…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                data-ocid="categories.description.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="categories.modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="categories.modal.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editCat ? (
                "Update"
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deletingName}
        onOpenChange={(open) => !open && setDeletingName(null)}
      >
        <AlertDialogContent data-ocid="categories.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingName}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="categories.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCat.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="categories.delete.confirm_button"
            >
              {deleteCat.isPending ? (
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
