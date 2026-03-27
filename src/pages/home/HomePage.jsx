import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
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
import { getProblemDetailMessage } from "../../lib/problemDetail/ProblemDetail";
import { getProducoes, getVendas } from "../../services/api";

function isToday(value) {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [vendas, setVendas] = useState([]);
  const [producoes, setProducoes] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [vendasData, producoesData] = await Promise.all([getVendas(), getProducoes()]);
        setVendas(Array.isArray(vendasData) ? vendasData : []);
        setProducoes(Array.isArray(producoesData) ? producoesData : []);
      } catch (error) {
        setErrorMessage(getProblemDetailMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const vendasHoje = useMemo(() => vendas.filter((v) => isToday(v.dataHora)), [vendas]);
  const producoesHoje = useMemo(() => producoes.filter((p) => isToday(p.dataHora)), [producoes]);

  const totalVendasHoje = useMemo(
    () => vendasHoje.reduce((acc, venda) => acc + Number(venda.valorTotal || 0), 0),
    [vendasHoje]
  );

  const totalProducoesConcluidasHoje = useMemo(
    () => producoesHoje.filter((p) => p.status === "CONCLUIDO").length,
    [producoesHoje]
  );

  const cards = [
    {
      title: "VENDAS HOJE",
      value: vendasHoje.length,
      progress: 70,
      color: "#35C759",
      icon: <AttachMoneyOutlinedIcon />,
      iconBg: "#ECFDF3",
    },
    {
      title: "RECEITA HOJE",
      value: totalVendasHoje.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      progress: 70,
      color: "#4F46E5",
      icon: <ReceiptLongOutlinedIcon />,
      iconBg: "#EEF2FF",
    },
    {
      title: "PRODUÇÕES HOJE",
      value: producoesHoje.length,
      progress: 68,
      color: "#142B73",
      icon: <PrecisionManufacturingOutlinedIcon />,
      iconBg: "#EEF2FF",
    },
    {
      title: "CONCLUÍDAS HOJE",
      value: totalProducoesConcluidasHoje,
      progress: 65,
      color: "#4F7DF3",
      icon: <ScienceOutlinedIcon />,
      iconBg: "#EEF2FF",
    },
  ];

  const activities = [
    { title: "Vendas registradas hoje", time: `${vendasHoje.length} no total`, color: "#35C759", bg: "#ECFDF3" },
    { title: "Produções registradas hoje", time: `${producoesHoje.length} no total`, color: "#4F46E5", bg: "#EEF2FF" },
    { title: "Produções concluídas hoje", time: `${totalProducoesConcluidasHoje} concluída(s)`, color: "#4F7DF3", bg: "#EEF2FF" },
    {
      title: "Receita de vendas de hoje",
      time: totalVendasHoje.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      color: "#F59E0B",
      bg: "#FFF7ED",
    },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <Paper
          sx={{
            minHeight: 260,
            borderRadius: "18px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Carregando dashboard...</Typography>
          </Stack>
        </Paper>
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : (
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
                    <Typography sx={{ fontWeight: 800, fontSize: 24, color: "#000" }}>
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
                  Resumo Operacional
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                  Indicadores resumidos de vendas e produções
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
      )}
    </AdminLayout>
  );
}