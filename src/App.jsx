import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import InventoryPage from "./pages/InventoryPage";
import PurchasePage from "./pages/PurchasePage";
import CustomerPage from "./pages/CustomerPage";
import BrandPage from "./pages/BrandPage";
import CategoryPage from "./pages/CategoryPage";
import ExpensePage from "./pages/ExpensePage";
import ExpenseTypePage from "./pages/ExpenseTypePage";
import SupplierPage from "./pages/SupplierPage";
import UserPage from "./pages/UserPage";
import UnitPage from "./pages/UnitPage";
import StorePage from "./pages/StorePage";
import RolePermissionPage from "./pages/RolePermissionPage";
import DailyMonthlyReportPage from "./pages/reports/DailyMonthlyReportPage";
import SaleReportPage from "./pages/reports/SaleReportPage";
import PurchaseReportPage from "./pages/reports/PurchaseReportPage";
import ProductStockReportPage from "./pages/reports/ProductStockReportPage";
import FinancialReportPage from "./pages/reports/FinancialReportPage";
import ReportsPage from "./pages/reports/ReportsPage";
import CustomerReportPage from "./pages/reports/CustomerReportPage";
import ProfitLossReportPage from "./pages/reports/ProfitLossReportPage";
import VendorInvoicePage from "./pages/VendorInvoicePage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import CatalogPage from "./pages/CatalogPage";
import { applyTheme } from "./utils/darkMode";
import ToastrContainer from "./components/Toastr";
import ManageDeliveryPage from "./pages/ManageDeliveryPage";
import POSPage from "./pages/POSPage";
import AuthLogsPage from "./pages/AuthLogsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("auth_token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    applyTheme(isDark);

    const savedLang = localStorage.getItem("app_lang") || "en";
    document.documentElement.lang = savedLang;
  }, []);

  return (
    <BrowserRouter>
      <ToastrContainer />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-history"
          element={
            <ProtectedRoute>
              <SalesHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <PurchasePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brands"
          element={
            <ProtectedRoute>
              <BrandPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense-types"
          element={
            <ProtectedRoute>
              <ExpenseTypePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SupplierPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <UnitPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <RolePermissionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DailyMonthlyReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/sales"
          element={
            <ProtectedRoute>
              <SaleReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/purchases"
          element={
            <ProtectedRoute>
              <PurchaseReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/products"
          element={
            <ProtectedRoute>
              <ProductStockReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/financial"
          element={
            <ProtectedRoute>
              <FinancialReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports-overview"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/customers"
          element={
            <ProtectedRoute>
              <CustomerReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/profit-loss"
          element={
            <ProtectedRoute>
              <ProfitLossReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor-invoices"
          element={
            <ProtectedRoute>
              <VendorInvoicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock-adjustment"
          element={
            <ProtectedRoute>
              <StockAdjustmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/catalog"
          element={
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/delivery-orders"
          element={
            <ProtectedRoute>
              <ManageDeliveryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <POSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth-logs"
          element={
            <ProtectedRoute>
              <AuthLogsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
