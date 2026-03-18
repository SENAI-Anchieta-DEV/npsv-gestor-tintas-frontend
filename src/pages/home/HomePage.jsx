import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AdminLayout from "../../components/layout/AdminLayout";

const cards = [
  {
    title: "PRODUTOS CADASTRADOS",
    value: "25",
    progress: 65,
    color: "#4F7DF3",
    icon: <Inventory2OutlinedIcon />,
    iconBg: "#EEF2FF",
  },
  {
    title: "TOTAL DE FÓRMULAS",
    value: "50",
    progress: 64,
    color: "#4F46E5",
    icon: <ScienceOutlinedIcon />,
    iconBg: "#EEF2FF",
  },
  {
    title: "PRODUÇÃO HOJE",
    value: "17",
    progress: 62,
    color: "#142B73",
    icon: <PrecisionManufacturingOutlinedIcon />,
    iconBg: "#EEF2FF",
  },
  {
    title: "VENDAS",
    value: "8",
    progress: 65,
    color: "#35C759",
    icon: <AttachMoneyOutlinedIcon />,
    iconBg: "#ECFDF3",
  },
  {
    title: "CLIENTES",
    value: "45",
    progress: 65,
    color: "#4F7DF3",
    icon: <PeopleOutlineOutlinedIcon />,
    iconBg: "#EEF2FF",
  },
  {
    title: "FORNECEDORES",
    value: "12",
    progress: 64,
    color: "#F59E0B",
    icon: <BusinessOutlinedIcon />,
    iconBg: "#FFF7ED",
  },
  {
    title: "PEDIDOS",
    value: "23",
    progress: 62,
    color: "#4F46E5",
    icon: <ReceiptLongOutlinedIcon />,
    iconBg: "#EEF2FF",
  },
  {
    title: "ESTOQUE BAIXO",
    value: "5",
    progress: 65,
    color: "#EAB308",
    icon: <WarningAmberOutlinedIcon />,
    iconBg: "#FEFCE8",
  },
];

const activities = [
  { title: "Nova venda registrada", time: "Há 5 minutos", color: "#35C759", bg: "#ECFDF3" },
  { title: "Produto adicionado ao estoque", time: "Há 15 minutos", color: "#4F7DF3", bg: "#EEF2FF" },
  { title: "Produção de tinta finalizada", time: "Há 1 hora", color: "#4F46E5", bg: "#EEF2FF" },
  { title: "Novo cliente cadastrado", time: "Há 2 horas", color: "#F59E0B", bg: "#FFF7ED" },
  { title: "Alerta: Estoque baixo detectado", time: "Há 3 horas", color: "#EAB308", bg: "#FEFCE8" },
];

export default function HomePage() {
  return (
    <AdminLayout>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 6, xl: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "18px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1.2 }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 26, color: "#000" }}>
                    {card.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: card.iconBg,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={card.progress}
                sx={{
                  mt: 2.5,
                  height: 8,
                  borderRadius: "999px",
                  bgcolor: "#ECECEC",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: card.color,
                  },
                }}
              />
            </Paper>
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              borderRadius: "18px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0B1739", mb: 0.5 }}>
                Atividade Recente
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Últimas movimentações do sistema
              </Typography>
            </Box>

            <Box sx={{ borderTop: "1px solid #E5E7EB", p: 3 }}>
              <Stack spacing={2.2}>
                {activities.map((item) => (
                  <Stack key={item.title} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "12px",
                        bgcolor: item.bg,
                        color: item.color,
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                      }}
                    >
                      ●
                    </Box>

                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                        {item.time}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}