import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { useLowStockMedicines } from "../hooks/useQueries";
import { formatCurrency } from "../lib/dateUtils";
import { sampleMedicines } from "../lib/sampleData";

export default function LowStock() {
  const { data: lowStockData, isLoading } = useLowStockMedicines();

  const lowStock =
    lowStockData && lowStockData.length > 0
      ? lowStockData
      : sampleMedicines.filter(
          (m) => Number(m.quantity) < Number(m.reorderLevel),
        );

  const criticalItems = lowStock.filter((m) => Number(m.quantity) === 0).length;
  const nearEmptyItems = lowStock.filter(
    (m) =>
      Number(m.quantity) > 0 &&
      Number(m.quantity) <= Number(m.reorderLevel) / 2,
  ).length;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            Low Stock Alerts
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {lowStock.length} medicines below reorder level
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Alerts",
            value: lowStock.length,
            color: "text-foreground",
            bg: "bg-muted",
          },
          {
            label: "Critical (Out of Stock)",
            value: criticalItems,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
          {
            label: "Near Empty (<50% reorder)",
            value: nearEmptyItems,
            color: "text-warning",
            bg: "bg-warning/10",
          },
        ].map(({ label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${bg} rounded-xl p-4 border border-border`}
          >
            <div className={`text-2xl font-display font-bold ${color}`}>
              {value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="low_stock.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
              <TableHead className="font-semibold text-xs">Medicine</TableHead>
              <TableHead className="font-semibold text-xs hidden sm:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs">
                Stock Level
              </TableHead>
              <TableHead className="font-semibold text-xs text-right hidden md:table-cell">
                Unit Price
              </TableHead>
              <TableHead className="font-semibold text-xs">Urgency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => i).map((idx) => (
                <TableRow key={`row-${idx}`} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : lowStock.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="low_stock.empty_state"
                >
                  <div className="flex flex-col items-center gap-2">
                    <TrendingDown className="w-8 h-8 opacity-30" />
                    All medicines are well stocked!
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              lowStock.map((med, idx) => {
                const qty = Number(med.quantity);
                const reorder = Number(med.reorderLevel);
                const stockPct =
                  reorder > 0 ? Math.min((qty / reorder) * 100, 100) : 0;
                const isOutOfStock = qty === 0;
                const isVeryLow = qty <= reorder / 2;

                return (
                  <TableRow
                    key={med.id}
                    className={`border-border ${isOutOfStock ? "bg-destructive/5" : isVeryLow ? "bg-warning/5" : ""}`}
                    data-ocid={`low_stock.item.${idx + 1}`}
                  >
                    <TableCell className="py-3">
                      <div className="font-medium text-sm">{med.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {med.genericName}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {med.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm ${isOutOfStock ? "text-destructive" : isVeryLow ? "text-warning" : "text-foreground"}`}
                          >
                            {qty}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {reorder} min
                          </span>
                        </div>
                        <Progress
                          value={stockPct}
                          className={`h-1.5 w-24 ${isOutOfStock ? "[&>div]:bg-destructive" : isVeryLow ? "[&>div]:bg-warning" : "[&>div]:bg-primary"}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell text-sm text-muted-foreground">
                      {formatCurrency(med.unitPrice)}
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      ) : isVeryLow ? (
                        <Badge className="text-xs bg-warning text-warning-foreground">
                          Critical
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
