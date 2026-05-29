import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, IconButton, Stack, Typography, useTheme } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import { useColorMode } from "../../context/ColorModeContext";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Categorias", path: "/categorias-produtos", icon: <CategoryOutlinedIcon /> },
  { label: "Produtos", path: "/produtos", icon: <Inventory2OutlinedIcon /> },
  { label: "Fórmulas", path: "/formulas", icon: <ScienceOutlinedIcon /> },
  { label: "Aba da Máquina", path: "/aba-maquina", icon: <PrecisionManufacturingOutlinedIcon /> },
  { label: "Histórico Produção", path: "/historico-producao", icon: <HistoryOutlinedIcon /> },
  { label: "Vendas", path: "/vendas", icon: <ShoppingCartOutlinedIcon /> },
  { label: "Clientes", path: "/clientes", icon: <PeopleOutlineOutlinedIcon /> },
  { label: "Fornecedores", path: "/fornecedores", icon: <LocalShippingOutlinedIcon /> },
  { label: "Pedidos", path: "/pedidos", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Usuários", path: "/usuarios", icon: <GroupOutlinedIcon /> },
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
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  const currentDate = useMemo(() => formatCurrentDate(), []);

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  const sidebarBg =
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg, #0F172A 0%, #111827 100%)"
      : "linear-gradient(180deg, #0F1E63 0%, #162B87 100%)";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
      }}
    >
      <Box
        sx={{
          width: 248,
          minHeight: "100vh",
          background: sidebarBg,
          color: "#fff",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
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
                  background: "linear-gradient(135deg, #4F46E5, #2B82FF)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <OpacityOutlinedIcon sx={{ color: "#fff" }} />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>
                  Gestor Tintas
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)" }}>
                  Painel administrativo
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={0.7} sx={{ px: 1.8, py: 2 }}>
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Box
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    px: 1.6,
                    py: 1.25,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.4,
                    cursor: "pointer",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.85)",
                    background: active
                      ? "linear-gradient(135deg, rgba(79,70,229,0.92), rgba(59,130,246,0.78))"
                      : "transparent",
                    boxShadow: active ? "0 10px 20px rgba(15,23,42,0.18)" : "none",
                    "&:hover": {
                      background: active
                        ? "linear-gradient(135deg, rgba(79,70,229,0.92), rgba(59,130,246,0.78))"
                        : "rgba(255,255,255,0.06)",
                    },
                    transition: "all .18s ease",
                  }}
                >
                  <Box sx={{ display: "grid", placeItems: "center" }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: 14, fontWeight: active ? 800 : 600 }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box
          sx={{
            px: 2.2,
            py: 2.2,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                Tema atual
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {mode === "dark" ? "Escuro" : "Claro"}
              </Typography>
            </Box>

            <IconButton
              onClick={toggleColorMode}
              sx={{
                width: 40,
                height: 40,
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.08)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.14)",
                },
              }}
            >
              {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            height: 68,
            px: { xs: 2, md: 3 },
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(10px)",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Sistema de Gestão de Tintas
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              Operação centralizada da loja
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              textTransform: "capitalize",
              display: { xs: "none", md: "block" },
            }}
          >
            {currentDate}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}