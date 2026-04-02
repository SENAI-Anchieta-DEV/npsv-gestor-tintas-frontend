import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Produtos", path: "/produtos", icon: <Inventory2OutlinedIcon /> },
  { label: "Fórmulas", path: "/formulas", icon: <ScienceOutlinedIcon /> },
  { label: "Estoque", path: "/estoque", icon: <WarehouseOutlinedIcon /> },
  { label: "Aba da Máquina", path: "/aba-maquina", icon: <PrecisionManufacturingOutlinedIcon /> },
  { label: "Histórico Produção", path: "/historico-producao", icon: <HistoryOutlinedIcon /> },
  { label: "Vendas", path: "/vendas", icon: <ShoppingCartOutlinedIcon /> },
  { label: "Clientes", path: "/clientes", icon: <PeopleOutlineOutlinedIcon /> },
  { label: "Fornecedores", path: "/fornecedores", icon: <LocalShippingOutlinedIcon /> },
  { label: "Pedidos", path: "/pedidos", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Usuários", path: "/usuarios", icon: <GroupOutlinedIcon /> },
  { label: "Relatórios", path: "/relatorios", icon: <BarChartOutlinedIcon /> },
  { label: "Configurações", path: "/configuracoes", icon: <SettingsOutlinedIcon /> },
];

function formatCurrentDate() {
  try {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentDate = useMemo(() => formatCurrentDate(), []);

  function isActive(path) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FB",
        display: "flex",
      }}
    >
      <Box
        sx={{
          width: 232,
          minHeight: "100vh",
          background: "#0F1E63",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box>
          <Box
            sx={{
              px: 2.5,
              py: 3,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #4F46E5, #3B82F6)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                }}
              >
                <OpacityOutlinedIcon />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
                  Gestor Tintas
                </Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.78)" }}>
                  v0.4 MVP
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={0.5} sx={{ px: 1.8, py: 2 }}>
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Box
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  sx={{
                    height: 42,
                    px: 1.6,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.88)",
                    background: active
                      ? "linear-gradient(135deg, #4F46E5, #4338CA)"
                      : "transparent",
                    boxShadow: active
                      ? "0 8px 18px rgba(79, 70, 229, 0.28)"
                      : "none",
                    "&:hover": {
                      background: active
                        ? "linear-gradient(135deg, #4F46E5, #4338CA)"
                        : "rgba(255,255,255,0.06)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      color: "inherit",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: active ? 700 : 600,
                      color: "inherit",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box
          sx={{
            px: 2.5,
            py: 2.5,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.72)", mb: 1.8 }}>
            Tema: Claro
          </Typography>

          <IconButton
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.14)",
              },
            }}
          >
            <DarkModeOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            height: 62,
            px: 3,
            borderBottom: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "#0B1739",
            }}
          >
            Sistema de Gestão de Tintas
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              color: "#6B7280",
              textTransform: "capitalize",
            }}
          >
            {currentDate}
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}