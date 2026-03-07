import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { UserRole } from "./backend.d";
import AppLayout from "./components/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserRole } from "./hooks/useQueries";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import ExpiryTracker from "./pages/ExpiryTracker";
import Inventory from "./pages/Inventory";
import LoginPage from "./pages/LoginPage";
import LowStock from "./pages/LowStock";
import NewSale from "./pages/NewSale";
import SalesHistory from "./pages/SalesHistory";
import Suppliers from "./pages/Suppliers";

export type Page =
  | "dashboard"
  | "inventory"
  | "categories"
  | "suppliers"
  | "new-sale"
  | "sales-history"
  | "low-stock"
  | "expiry";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"
            data-ocid="app.loading_state"
          />
          <p className="text-muted-foreground font-body text-sm">
            Initializing PharmaCare…
          </p>
        </div>
      </div>
    );
  }

  // Not logged in OR guest role — show login/onboarding
  if (!identity || userRole === UserRole.guest || (roleLoading && !userRole)) {
    return (
      <>
        <LoginPage onSuccess={() => {}} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "inventory":
        return <Inventory />;
      case "categories":
        return <Categories />;
      case "suppliers":
        return <Suppliers />;
      case "new-sale":
        return <NewSale />;
      case "sales-history":
        return <SalesHistory />;
      case "low-stock":
        return <LowStock />;
      case "expiry":
        return <ExpiryTracker />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppLayout>
      <Toaster richColors position="top-right" />
    </>
  );
}
