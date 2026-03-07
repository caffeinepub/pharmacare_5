import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Package, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSales } from "../hooks/useQueries";
import type { Sale } from "../hooks/useQueries";
import { formatCurrency, formatDateTime } from "../lib/dateUtils";
import { sampleSales } from "../lib/sampleData";

export default function SalesHistory() {
  const { data: salesData, isLoading } = useSales();
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  const sales =
    salesData && salesData.length > 0
      ? [...salesData].sort((a, b) => Number(b.timestamp - a.timestamp))
      : [...sampleSales].sort((a, b) => Number(b.timestamp - a.timestamp));

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Sales History
          </h1>
          <p className="text-muted-foreground text-sm">
            {sales.length} transactions · Total: {formatCurrency(totalRevenue)}
          </p>
        </div>
      </motion.div>

      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="sales_history.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
              <TableHead className="font-semibold text-xs">Sale ID</TableHead>
              <TableHead className="font-semibold text-xs">Customer</TableHead>
              <TableHead className="font-semibold text-xs hidden md:table-cell">
                Date & Time
              </TableHead>
              <TableHead className="font-semibold text-xs text-center hidden sm:table-cell">
                Items
              </TableHead>
              <TableHead className="font-semibold text-xs text-right">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-xs text-right">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => i).map((idx) => (
                <TableRow key={`row-${idx}`} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="sales_history.empty_state"
                >
                  No sales recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale, idx) => (
                <TableRow
                  key={sale.id}
                  className="border-border"
                  data-ocid={`sales_history.item.${idx + 1}`}
                >
                  <TableCell className="py-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {sale.id.slice(0, 8).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {sale.customerName}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDateTime(sale.timestamp)}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {sale.items.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-sm font-mono">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 hover:text-primary"
                      onClick={() => setViewSale(sale)}
                      data-ocid={`sales_history.view_button.${idx + 1}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sale Detail Modal */}
      <Dialog
        open={!!viewSale}
        onOpenChange={(open) => !open && setViewSale(null)}
      >
        <DialogContent data-ocid="sales_history.detail.dialog">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Sale Receipt
            </DialogTitle>
            <DialogDescription>
              {viewSale &&
                `Sale #${viewSale.id.slice(0, 8).toUpperCase()} · ${formatDateTime(viewSale.timestamp)}`}
            </DialogDescription>
          </DialogHeader>

          {viewSale && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {viewSale.customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {viewSale.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground">Customer</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> Items Purchased
                </div>
                <div className="space-y-1.5">
                  {viewSale.items.map((item) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {item.medicineName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} ×{" "}
                          {Number(item.quantity)}
                        </div>
                      </div>
                      <div className="font-mono font-semibold text-sm">
                        {formatCurrency(item.unitPrice * Number(item.quantity))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="font-display font-bold text-xl text-primary">
                  {formatCurrency(viewSale.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
