import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import HomePage from "./pages/home/HomePage";
import UsersPage from "./pages/users/UsersPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import ProductsPage from "./pages/products/ProductsPage";
import SalesHistoryPage from "./pages/sales/SalesHistoryPage";
import ProductionHistoryPage from "./pages/productions/ProductionHistoryPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>{title}</h2>
      <p>Página em construção.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
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
        path="/vendas"
        element={
          <ProtectedRoute>
            <SalesHistoryPage />
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
        path="/formulas"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Fórmulas" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/estoque"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Estoque" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/aba-maquina"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Aba da Máquina" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Clientes" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fornecedores"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Fornecedores" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pedidos"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Pedidos" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Relatórios" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Configurações" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}