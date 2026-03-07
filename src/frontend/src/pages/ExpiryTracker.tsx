import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertOctagon, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useExpiringMedicines } from "../hooks/useQueries";
import { daysUntilExpiry, formatCurrency, formatDate } from "../lib/dateUtils";
import { sampleMedicines } from "../lib/sampleData";

type DaysFilter = "30" | "60" | "90";

const URGENCY_CONFIG = {
  expired: {
    label: "Expired",
    variant: "destructive" as const,
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
  critical: {
    label: "< 30 days",
    variant: "destructive" as const,
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
  warning: {
    label: "31–60 days",
    variant: "secondary" as const,
    color: "text-warning",
    bg: "bg-warning/5",
  },
  caution: {
    label: "61–90 days",
    variant: "outline" as const,
    color: "text-foreground",
    bg: "",
  },
};

export default function ExpiryTracker() {
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("90");
  const { data: expiringData, isLoading } = useExpiringMedicines(
    Number.parseInt(daysFilter),
  );

  const expiring =
    expiringData && expiringData.length > 0
      ? expiringData
      : sampleMedicines.filter((m) => {
          const days = daysUntilExpiry(m.expiryDate);
          return days <= Number.parseInt(daysFilter);
        });

  const sorted = [...expiring].sort((a, b) =>
    Number(a.expiryDate - b.expiryDate),
  );

  const getDaysLabel = (filter: DaysFilter) => {
    switch (filter) {
      case "30":
        return "< 30 days";
      case "60":
        return "< 60 days";
      case "90":
        return "< 90 days";
    }
  };

  const getUrgency = (days: number) => {
    if (days <= 0) return "expired";
    if (days <= 30) return "critical";
    if (days <= 60) return "warning";
    return "caution";
  };

  const countByUrgency = (urgency: string) =>
    sorted.filter((m) => getUrgency(daysUntilExpiry(m.expiryDate)) === urgency)
      .length;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-warning" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            Expiry Tracker
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Medicines expiring within {getDaysLabel(daysFilter)}
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <Tabs
        value={daysFilter}
        onValueChange={(v) => setDaysFilter(v as DaysFilter)}
      >
        <TabsList data-ocid="expiry.filter.tab">
          <TabsTrigger value="30" data-ocid="expiry.30d.tab">
            Within 30 days
          </TabsTrigger>
          <TabsTrigger value="60" data-ocid="expiry.60d.tab">
            Within 60 days
          </TabsTrigger>
          <TabsTrigger value="90" data-ocid="expiry.90d.tab">
            Within 90 days
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Urgency Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "expired", label: "Expired", icon: "🚫" },
          { key: "critical", label: "Critical (<30d)", icon: "🔴" },
          { key: "warning", label: "Warning (31-60d)", icon: "🟡" },
          { key: "caution", label: "Caution (61-90d)", icon: "🟢" },
        ].map(({ key, label, icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl p-3 border border-border bg-card"
          >
            <div className="text-lg mb-0.5">{icon}</div>
            <div className="text-xl font-display font-bold text-foreground">
              {countByUrgency(key)}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.div>
        ))}
      </div>

      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="expiry.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
              <TableHead className="font-semibold text-xs">Medicine</TableHead>
              <TableHead className="font-semibold text-xs hidden sm:table-cell">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs">
                Expiry Date
              </TableHead>
              <TableHead className="font-semibold text-xs text-right hidden md:table-cell">
                Qty
              </TableHead>
              <TableHead className="font-semibold text-xs text-right hidden md:table-cell">
                Price
              </TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
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
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="expiry.empty_state"
                >
                  <div className="flex flex-col items-center gap-2">
                    <AlertOctagon className="w-8 h-8 opacity-30" />
                    No medicines expiring within {getDaysLabel(daysFilter)}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((med, idx) => {
                const days = daysUntilExpiry(med.expiryDate);
                const urgency = getUrgency(days);
                const config = URGENCY_CONFIG[urgency];

                return (
                  <TableRow
                    key={med.id}
                    className={`border-border ${config.bg}`}
                    data-ocid={`expiry.item.${idx + 1}`}
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
                      <div className={`font-medium text-sm ${config.color}`}>
                        {formatDate(med.expiryDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {days <= 0 ? "Expired" : `${days} days left`}
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell font-mono text-sm text-muted-foreground">
                      {Number(med.quantity)}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell text-sm text-muted-foreground">
                      {formatCurrency(med.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
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
