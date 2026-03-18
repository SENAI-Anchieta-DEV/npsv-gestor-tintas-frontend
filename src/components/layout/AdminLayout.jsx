import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Produtos", path: "/produtos", icon: <Inventory2OutlinedIcon /> },
  { label: "Fórmulas", path: "/formulas", icon: <ScienceOutlinedIcon /> },
  { label: "Estoque", path: "/estoque", icon: <WarehouseOutlinedIcon /> },
  { label: "Aba da Máquina", path: "/maquina", icon: <PrecisionManufacturingOutlinedIcon /> },
  { label: "Histórico Produção", path: "/historico", icon: <HistoryOutlinedIcon /> },
  { label: "Vendas", path: "/vendas", icon: <ShoppingCartOutlinedIcon /> },
  { label: "Clientes", path: "/clientes", icon: <PeopleOutlineIcon /> },
  { label: "Fornecedores", path: "/fornecedores", icon: <BusinessOutlinedIcon /> },
  { label: "Pedidos", path: "/pedidos", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Usuários", path: "/usuarios", icon: <ManageAccountsOutlinedIcon /> },
  { label: "Relatórios", path: "/relatorios", icon: <BarChartOutlinedIcon /> },
  { label: "Configurações", path: "/configuracoes", icon: <SettingsOutlinedIcon /> },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#F5F7FB" }}>
      <Box
        sx={{
          width: 254,
          bgcolor: "#102567",
          color: "#fff",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#3F5FFF",
              borderRadius: "14px",
            }}
          >
            <WaterDropOutlinedIcon />
          </Avatar>

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>
              Gestor Tintas
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>v0.4 MVP</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <List sx={{ px: 1.8, py: 2, flex: 1 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 0.8,
                  borderRadius: "16px",
                  px: 1.8,
                  py: 1.25,
                  color: "#fff",
                  bgcolor: active ? "linear-gradient(135deg,#4F46E5,#4338CA)" : "transparent",
                  background: active ? "linear-gradient(135deg,#4F46E5,#4338CA)" : "transparent",
                  "&:hover": {
                    background: active
                      ? "linear-gradient(135deg,#4F46E5,#4338CA)"
                      : "rgba(255,255,255,0.06)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: active ? 700 : 600,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <Box sx={{ p: 2.5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 13, opacity: 0.9, mb: 1.5 }}>
            Tema: Claro
          </Typography>
          <IconButton
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#17327F",
              color: "#fff",
              "&:hover": {
                bgcolor: "#1C3B92",
              },
            }}
          >
            <DarkModeOutlinedIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            height: 62,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#0B1739" }}>
            Sistema de Gestão de Tintas
          </Typography>

          <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>{children}</Box>

        <Box sx={{ position: "fixed", bottom: 18, right: 18 }}>
          <IconButton
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              color: "#6B7280",
              boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
            }}
          >
            <HelpOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}