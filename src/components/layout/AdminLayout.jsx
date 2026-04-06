import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
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
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useThemeMode } from "../../theme/ThemeModeContext";

const drawerWidth = 248;

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Categorias", path: "/categorias-produtos", icon: <CategoryOutlinedIcon /> },
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
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentDate = useMemo(() => formatCurrentDate(), []);

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  function handleNavigate(path) {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: mode === "dark" ? "#0F172A" : "#0F1E63",
        color: "#fff",
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4F46E5, #3B82F6)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <OpacityOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
              Gestor Tintas
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.78)" }}>
              v0.4 MVP
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <List sx={{ px: 1.2, py: 1.5, flex: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);

          return (
            <ListItemButton
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              selected={active}
              sx={{
                minHeight: 48,
                borderRadius: "14px",
                mb: 0.5,
                color: active ? "#fff" : "rgba(255,255,255,0.9)",
                background: active
                  ? "linear-gradient(135deg, #4F46E5, #4338CA)"
                  : "transparent",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #4F46E5, #4338CA)",
                },
                "&.Mui-selected:hover": {
                  background: "linear-gradient(135deg, #4F46E5, #4338CA)",
                },
                "&:hover": {
                  backgroundColor: active ? undefined : "rgba(255,255,255,0.06)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
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

      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
            Tema: {mode === "dark" ? "Escuro" : "Claro"}
          </Typography>

          <IconButton
            onClick={toggleColorMode}
            aria-label="Alternar tema"
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
            {mode === "dark" ? (
              <LightModeOutlinedIcon fontSize="small" />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
          }}
        >
          <Drawer
            variant="permanent"
            open
            PaperProps={{
              sx: {
                width: drawerWidth,
                border: 0,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: drawerWidth,
              border: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 64, md: 70 },
              px: { xs: 2, md: 3 },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  edge="start"
                  aria-label="Abrir menu"
                  sx={{ color: theme.palette.text.primary }}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              )}

              <Typography
                sx={{
                  fontSize: { xs: 16, md: 18 },
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Sistema de Gestão de Tintas
              </Typography>
            </Stack>

            {!isMobile && (
              <Typography
                sx={{
                  fontSize: 14,
                  color: theme.palette.text.secondary,
                  textTransform: "capitalize",
                  textAlign: "right",
                  minWidth: 0,
                }}
              >
                {currentDate}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}