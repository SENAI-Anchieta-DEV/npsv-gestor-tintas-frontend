import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import HomePage from "./pages/home/HomePage";
import LandingPage from "./pages/landing/LandingPage";
import UsersPage from "./pages/users/UsersPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import ProductsPage from "./pages/products/ProductsPage";
import FormulasPage from "./pages/formulas/FormulasPage";
import ProductionHistoryPage from "./pages/productions/ProductionsPage";
import SalesHistoryPage from "./pages/sales/SalesPage";
import ClientsPage from "./pages/clients/ClientsPage";
import SuppliersPage from "./pages/suppliers/SuppliersPage";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categorias-produtos"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/produtos"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/formulas"
        element={
          <ProtectedRoute>
            <FormulasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/historico-producao"
        element={
          <ProtectedRoute>
            <ProductionHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendas"
        element={
          <ProtectedRoute>
            <SalesHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fornecedores"
        element={
          <ProtectedRoute>
            <SuppliersPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}