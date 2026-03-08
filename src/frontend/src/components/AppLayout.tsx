import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Pill,
  ShoppingCart,
  Sun,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import type { Page } from "../App";
import { UserRole } from "../backend.d";
import { useDarkMode } from "../hooks/useDarkMode";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile, useUserRole } from "../hooks/useQueries";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  ocid: string;
  badge?: string;
  badgeVariant?: "destructive" | "secondary";
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    ocid: "nav.inventory.link",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tag,
    ocid: "nav.categories.link",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: Truck,
    ocid: "nav.suppliers.link",
  },
  {
    id: "new-sale",
    label: "New Sale",
    icon: ShoppingCart,
    ocid: "nav.new_sale.link",
  },
  {
    id: "sales-history",
    label: "Sales History",
    icon: History,
    ocid: "nav.sales.link",
  },
  {
    id: "low-stock",
    label: "Low Stock",
    icon: AlertTriangle,
    ocid: "nav.low_stock.link",
  },
  {
    id: "expiry",
    label: "Expiry Tracker",
    icon: Clock,
    ocid: "nav.expiry.link",
  },
];

interface AppLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export default function AppLayout({
  currentPage,
  onNavigate,
  children,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: role } = useUserRole();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const roleLabel = role === UserRole.admin ? "Admin" : "Pharmacist";
  const roleColor =
    role === UserRole.admin
      ? "bg-accent text-accent-foreground"
      : "bg-secondary text-secondary-foreground";
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PH";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.72 0.14 168)" }}
          >
            <Pill className="w-5 h-5 text-sidebar" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sidebar-foreground text-lg leading-none">
              PharmaCare
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(var(--sidebar-foreground-muted))" }}
            >
              Management System
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav
        className="flex-1 p-3 space-y-0.5 overflow-y-auto"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              style={
                !isActive
                  ? { color: "oklch(var(--sidebar-foreground-muted))" }
                  : undefined
              }
              data-ocid={item.ocid}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge
                  variant={item.badgeVariant || "secondary"}
                  className="text-xs h-5 px-1.5"
                >
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </button>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User footer */}
      <div className="p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-bold bg-sidebar-accent text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.name || "Pharmacist"}
            </div>
            <Badge className={`text-xs h-4 px-1.5 mt-0.5 ${roleColor}`}>
              {roleLabel}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            style={{ color: "oklch(var(--sidebar-foreground-muted))" }}
            onClick={toggleDark}
            title="Toggle dark mode"
            data-ocid="nav.darkmode.toggle"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            style={{ color: "oklch(var(--sidebar-foreground-muted))" }}
            onClick={clear}
            title="Log out"
            data-ocid="nav.logout.button"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-60 flex-col flex-shrink-0 border-r border-sidebar-border"
        style={{ background: "oklch(var(--sidebar))" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-60 z-50 flex flex-col border-r border-sidebar-border lg:hidden"
              style={{ background: "oklch(var(--sidebar))" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-ocid="nav.menu.toggle"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">
              PharmaCare
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-muted-foreground"
            onClick={toggleDark}
            title="Toggle dark mode"
            data-ocid="nav.darkmode.toggle"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
