import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  ArrowRight,
  Calendar,
  Clock,
  Package,
  Tag,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import {
  useDashboardStats,
  useExpiringMedicines,
  useLowStockMedicines,
  useMedicines,
} from "../hooks/useQueries";
import { daysUntilExpiry, formatCurrency, formatDate } from "../lib/dateUtils";
import { sampleMedicines } from "../lib/sampleData";

const STAT_CARDS = [
  {
    key: "totalMedicines",
    label: "Total Medicines",
    icon: Package,
    color: "text-primary",
    bg: "bg-primary/10",
    desc: "Active items in inventory",
  },
  {
    key: "totalCategories",
    label: "Total Categories",
    icon: Tag,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    desc: "Medicine categories",
  },
  {
    key: "lowStockCount",
    label: "Low Stock Alerts",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    desc: "Below reorder level",
  },
  {
    key: "expiringSoonCount",
    label: "Expiring Soon",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    desc: "Within 90 days",
  },
] as const;

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: lowStockData } = useLowStockMedicines();
  const { data: expiringData } = useExpiringMedicines(90);
  const { data: medicines } = useMedicines();

  // Use sample data as fallback
  const lowStock =
    lowStockData && lowStockData.length > 0
      ? lowStockData
      : sampleMedicines.filter(
          (m) => Number(m.quantity) < Number(m.reorderLevel),
        );
  const expiring =
    expiringData && expiringData.length > 0
      ? expiringData
      : sampleMedicines.filter((m) => daysUntilExpiry(m.expiryDate) <= 90);

  const statValues: Record<string, bigint | number> = stats
    ? {
        totalMedicines: stats.totalMedicines,
        totalCategories: stats.totalCategories,
        lowStockCount: stats.lowStockCount,
        expiringSoonCount: stats.expiringSoonCount,
      }
    : {
        totalMedicines: BigInt(
          medicines && medicines.length > 0
            ? medicines.length
            : sampleMedicines.length,
        ),
        totalCategories: BigInt(6),
        lowStockCount: BigInt(lowStock.length),
        expiringSoonCount: BigInt(expiring.length),
      };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, desc }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            data-ocid="dashboard.stats.card"
          >
            <Card className="border-border hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {statsLoading ? (
                  <Skeleton
                    className="h-7 w-16 mb-1"
                    data-ocid="dashboard.stats.loading_state"
                  />
                ) : (
                  <div className={`text-2xl font-display font-bold ${color}`}>
                    {Number(statValues[key]).toLocaleString()}
                  </div>
                )}
                <div className="font-medium text-sm text-foreground mt-0.5">
                  {label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {desc}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Low Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <CardTitle className="text-base font-display">
                    Low Stock Medicines
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("low-stock")}
                  className="h-7 text-xs gap-1 text-primary hover:text-primary"
                  data-ocid="dashboard.low_stock.link"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {lowStock.length === 0 ? (
                <div
                  className="px-5 py-8 text-center text-muted-foreground text-sm"
                  data-ocid="dashboard.low_stock.empty_state"
                >
                  All medicines are well stocked! ✓
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs font-semibold pl-5">
                        Medicine
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right">
                        Qty
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right pr-5">
                        Reorder
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.slice(0, 5).map((med, idx) => (
                      <TableRow
                        key={med.id}
                        className="border-border"
                        data-ocid={`dashboard.low_stock.item.${idx + 1}`}
                      >
                        <TableCell className="pl-5 py-2.5">
                          <div className="font-medium text-sm truncate max-w-[150px]">
                            {med.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {med.category}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive" className="text-xs">
                            {Number(med.quantity)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-5 text-sm text-muted-foreground">
                          {Number(med.reorderLevel)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Expiring Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-warning" />
                  <CardTitle className="text-base font-display">
                    Expiring Soon (90 days)
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("expiry")}
                  className="h-7 text-xs gap-1 text-primary hover:text-primary"
                  data-ocid="dashboard.expiry.link"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {expiring.length === 0 ? (
                <div
                  className="px-5 py-8 text-center text-muted-foreground text-sm"
                  data-ocid="dashboard.expiry.empty_state"
                >
                  No medicines expiring within 90 days! ✓
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs font-semibold pl-5">
                        Medicine
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right">
                        Expiry
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right pr-5">
                        Price
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiring.slice(0, 5).map((med, idx) => {
                      const days = daysUntilExpiry(med.expiryDate);
                      const urgency =
                        days <= 30
                          ? "destructive"
                          : days <= 60
                            ? "secondary"
                            : "outline";
                      return (
                        <TableRow
                          key={med.id}
                          className="border-border"
                          data-ocid={`dashboard.expiry.item.${idx + 1}`}
                        >
                          <TableCell className="pl-5 py-2.5">
                            <div className="font-medium text-sm truncate max-w-[150px]">
                              {med.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {days}d left
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={urgency} className="text-xs">
                              {formatDate(med.expiryDate)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-5 text-sm text-muted-foreground">
                            {formatCurrency(med.unitPrice)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
