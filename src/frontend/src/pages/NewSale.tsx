import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateSale, useMedicines } from "../hooks/useQueries";
import type { Medicine, SaleItem } from "../hooks/useQueries";
import { formatCurrency } from "../lib/dateUtils";
import { sampleMedicines } from "../lib/sampleData";

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export default function NewSale() {
  const { data: medicinesData } = useMedicines();
  const createSale = useCreateSale();

  const [customerName, setCustomerName] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleId, setSaleId] = useState<string | null>(null);

  const medicines =
    medicinesData && medicinesData.length > 0 ? medicinesData : sampleMedicines;
  const activeMedicines = medicines.filter(
    (m) => m.isActive && Number(m.quantity) > 0,
  );

  const searchResults =
    medicineSearch.length >= 1
      ? activeMedicines
          .filter(
            (m) =>
              m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
              m.genericName
                .toLowerCase()
                .includes(medicineSearch.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  const addToCart = (med: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.medicine.id === med.id);
      if (existing) {
        return prev.map((i) =>
          i.medicine.id === med.id
            ? { ...i, quantity: Math.min(i.quantity + 1, Number(med.quantity)) }
            : i,
        );
      }
      return [...prev, { medicine: med, quantity: 1 }];
    });
    setMedicineSearch("");
  };

  const updateQty = (medId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.medicine.id !== medId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.medicine.id === medId ? { ...i, quantity: qty } : i,
        ),
      );
    }
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => prev.filter((i) => i.medicine.id !== medId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.medicine.unitPrice * item.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const items: SaleItem[] = cart.map((item) => ({
      medicineId: item.medicine.id,
      medicineName: item.medicine.name,
      quantity: BigInt(item.quantity),
      unitPrice: item.medicine.unitPrice,
    }));

    try {
      const id = await createSale.mutateAsync({
        customerName: customerName.trim(),
        items,
        totalAmount: total,
      });
      setSaleId(id || `SALE-${Date.now()}`);
      setCart([]);
      setCustomerName("");
    } catch {
      toast.error("Failed to create sale. Please try again.");
    }
  };

  const resetForNewSale = () => {
    setSaleId(null);
    setMedicineSearch("");
  };

  if (saleId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="max-w-md w-full text-center"
          data-ocid="sale.success_state"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Sale Complete!
          </h2>
          <p className="text-muted-foreground mb-1">
            Sale ID:{" "}
            <span className="font-mono text-sm font-medium text-foreground">
              {saleId}
            </span>
          </p>
          <div className="my-6 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Receipt Summary
              </span>
            </div>
            <div className="text-3xl font-display font-bold text-primary mt-2">
              {formatCurrency(total)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {cart.length} item(s) sold
            </div>
          </div>
          <Button
            onClick={resetForNewSale}
            className="gap-2"
            data-ocid="sale.new_sale.primary_button"
          >
            <ShoppingCart className="w-4 h-4" /> New Sale
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          New Sale
        </h1>
        <p className="text-muted-foreground text-sm">
          Create a new billing transaction
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr,340px] gap-5">
        {/* Left: Customer + Medicine Search */}
        <div className="space-y-4">
          {/* Customer Name */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input
                  id="customer-name"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  data-ocid="sale.customer_input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medicine Search */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Add Medicines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or generic name…"
                  className="pl-9"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  data-ocid="sale.medicine_search_input"
                />
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    {searchResults.map((med) => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => addToCart(med)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-0 text-left"
                        data-ocid="sale.medicine_result.button"
                      >
                        <div>
                          <div className="font-medium text-sm">{med.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {med.genericName} · {med.category}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="text-sm font-medium">
                            {formatCurrency(med.unitPrice)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Number(med.quantity)} in stock
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {medicineSearch && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No medicines found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart */}
        <Card className="border-border h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" /> Cart
              </CardTitle>
              {cart.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {cart.length} item{cart.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="sale.cart.empty_state"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Search and add medicines above
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {cart.map((item, idx) => (
                    <motion.div
                      key={item.medicine.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                      data-ocid={`sale.cart.item.${idx + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">
                          {item.medicine.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.medicine.unitPrice)} each
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.medicine.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          data-ocid={`sale.cart.decrease.${idx + 1}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-mono font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(
                              item.medicine.id,
                              Math.min(
                                item.quantity + 1,
                                Number(item.medicine.quantity),
                              ),
                            )
                          }
                          className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          data-ocid={`sale.cart.increase.${idx + 1}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.medicine.id)}
                          className="w-6 h-6 ml-0.5 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
                          data-ocid={`sale.cart.remove.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Separator />

                {/* Line items total */}
                <div className="space-y-1.5">
                  {cart.map((item) => (
                    <div
                      key={item.medicine.id}
                      className="flex justify-between text-xs text-muted-foreground"
                    >
                      <span className="truncate max-w-[160px]">
                        {item.medicine.name} × {item.quantity}
                      </span>
                      <span className="font-mono">
                        {formatCurrency(
                          item.medicine.unitPrice * item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Total</span>
                  <span className="font-display font-bold text-lg text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createSale.isPending || !customerName.trim()}
                  className="w-full gap-2"
                  data-ocid="sale.submit_button"
                >
                  {createSale.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Complete Sale
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
