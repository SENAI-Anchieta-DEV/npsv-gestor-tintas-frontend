import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Produtos", path: "/produtos", icon: <Inventory2OutlinedIcon /> },
  { label: "Fórmulas", path: "/formulas", icon: <ScienceOutlinedIcon /> },
  { label: "Estoque", path: "/estoque", icon: <WarehouseOutlinedIcon /> },
  { label: "Usuários", path: "/usuarios", icon: <PeopleAltOutlinedIcon /> },
  { label: "Relatórios", path: "/relatorios", icon: <BarChartOutlinedIcon /> },
  { label: "Configurações", path: "/configuracoes", icon: <SettingsOutlinedIcon /> },
];

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      <Box
        sx={{
          width: 260,
          bgcolor: "#0D2266",
          color: "#fff",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800}>
            Gestor Tintas
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            v0.4 MVP
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 3,
                  color: "#fff",
                  bgcolor: active ? "primary.main" : "transparent",
                  "&:hover": {
                    bgcolor: active ? "primary.main" : "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Paper
          square
          sx={{
            px: { xs: 2, md: 4 },
            py: 2.5,
            borderBottom: "1px solid #E5E7EB",
            borderRadius: 0,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{title}</Typography>
            <Typography color="text.secondary">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Typography>
          </Stack>
        </Paper>

        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}