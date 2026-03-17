import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import AdminLayout from "../../components/layout/AdminLayout";

const cards = [
  { title: "Produtos cadastrados", value: "25", progress: 65, icon: <ShoppingBagOutlinedIcon />, color: "secondary.main" },
  { title: "Total de fórmulas", value: "50", progress: 64, icon: <ScienceOutlinedIcon />, color: "primary.main" },
  { title: "Produção hoje", value: "17", progress: 48, icon: <PrecisionManufacturingOutlinedIcon />, color: "#0D2266" },
  { title: "Vendas", value: "8", progress: 66, icon: <AttachMoneyOutlinedIcon />, color: "success.main" },
];

const activities = [
  "Nova venda registrada",
  "Produto adicionado ao estoque",
  "Produção de tinta finalizada",
  "Novo cliente cadastrado",
];

export default function HomePage() {
  return (
    <AdminLayout title="Sistema de Gestão de Tintas">
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} md={6} xl={3} key={card.title}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1.5, mb: 2 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#EEF2FF",
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
                  height: 8,
                  borderRadius: 999,
                  bgcolor: "#ECECEC",
                  "& .MuiLinearProgress-bar": { backgroundColor: card.color },
                }}
              />
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Atividade Recente
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Últimas movimentações do sistema
            </Typography>

            <Stack spacing={2}>
              {activities.map((activity) => (
                <Paper
                  key={activity}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 3, borderColor: "#EEF2F7" }}
                >
                  <Typography fontWeight={700}>{activity}</Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}