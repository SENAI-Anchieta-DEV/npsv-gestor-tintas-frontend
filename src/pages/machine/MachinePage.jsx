import { useEffect, useMemo, useRef, useState } from "react";
import mqtt from "mqtt";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  cancelarProducao,
  concluirProducao,
  getEventosPesagem,
  getPesagemAtual,
  getProducoes,
} from "../../services/api";

const MQTT_URL = process.env.MQTT_URL || "ws://localhost:9001";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "gestor-tintas/pesagem";

function formatWeight(value) {
  return `${Number(value || 0).toFixed(1)}g`;
}

function getDifference(actual, target) {
  return Number(actual || 0) - Number(target || 0);
}

function getStatusByDifference(diff, tolerance = 5) {
  const abs = Math.abs(diff);
  if (abs <= tolerance) return "success";
  if (abs <= tolerance + 5) return "warning";
  return "danger";
}

function getStatusLabel(status) {
  if (status === "success") return "Dentro da margem";
  if (status === "warning") return "Aproximação";
  return "Erro de dosagem";
}

function normalizeProduction(data) {
  const itens = Array.isArray(data?.formula?.itens)
    ? data.formula.itens
    : Array.isArray(data?.itens || data?.componentes)
    ? data.itens || data.componentes
    : [];

  return {
    id: data?.id,
    formulaNome:
      data?.formulaNome ||
      data?.formula?.nomeCor ||
      data?.formula?.nome ||
      "Fórmula ativa",
    formulaCodigo:
      data?.formulaCodigo ||
      data?.formula?.codigoInterno ||
      data?.formula?.codigo ||
      "",
    status: data?.status || "PROCESSANDO",
    itens: itens.map((item, index) => ({
      id: item?.id || `${index}`,
      nome:
        item?.insumo?.descricao ||
        item?.nomeProduto ||
        item?.produtoNome ||
        item?.nome ||
        `Item ${index + 1}`,
      alvo: Number(
        item?.quantidadeNecessaria ||
          item?.pesoAlvo ||
          item?.quantidadeAlvo ||
          item?.alvo ||
          0
      ),
      atual: Number(item?.pesoAtual || 0),
      ordem: Number(item?.ordemAdicao || item?.ordem || index + 1),
    })),
  };
}

export default function MachinePage() {
  const { showSnackbar } = useAppSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");
  const [production, setProduction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [timestamp, setTimestamp] = useState("--:--:--");
  const [protocolLabel, setProtocolLabel] = useState("MQTT • WebSocket");

  const clientRef = useRef(null);

  async function loadActiveProduction() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getProducoes();
      const lista = Array.isArray(data) ? data : [];
      const ativa = lista.find((item) =>
        ["PENDENTE", "PROCESSANDO"].includes(item?.status)
      );

      if (!ativa) {
        setProduction(null);
        return;
      }

      const producaoNormalizada = normalizeProduction(ativa);

      try {
        const pesagemAtual = await getPesagemAtual(ativa.id);
        const eventos = await getEventosPesagem(ativa.id);
        const historico = Array.isArray(eventos) ? eventos : [];
        const itemIndex = Math.min(
          historico.length,
          Math.max(producaoNormalizada.itens.length - 1, 0)
        );

        const itensAtualizados = producaoNormalizada.itens.map((item, index) => ({
          ...item,
          atual: index === itemIndex ? Number(pesagemAtual?.pesoLido || 0) : item.atual,
        }));

        setTimestamp(new Date().toLocaleTimeString("pt-BR"));
        setProduction({ ...producaoNormalizada, itens: itensAtualizados });
      } catch {
        setProduction(producaoNormalizada);
      }
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
      setProduction(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActiveProduction();
  }, []);

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL, {
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      setConnectionStatus("Conectado");
      setProtocolLabel("MQTT • ESP32");
      client.subscribe(MQTT_TOPIC);
    });

    client.on("reconnect", () => {
      setConnectionStatus("Reconectando...");
    });

    client.on("error", () => {
      setConnectionStatus("Erro de conexão");
    });

    client.on("message", (_, payloadBuffer) => {
      try {
        const payload = JSON.parse(payloadBuffer.toString());

        setTimestamp(
          new Date(payload?.timestamp || Date.now()).toLocaleTimeString("pt-BR")
        );

        setProduction((prev) => {
          if (!prev) return prev;

          const componenteId =
            payload?.itemId || payload?.componenteId || payload?.ordem;

          const nextItems = prev.itens.map((item) => {
            const sameById = String(item.id) === String(componenteId);
            const sameByOrder = Number(item.ordem) === Number(componenteId);

            if (sameById || sameByOrder) {
              return {
                ...item,
                atual: Number(payload?.pesoAtual ?? payload?.peso ?? item.atual),
              };
            }

            return item;
          });

          return {
            ...prev,
            itens: nextItems,
          };
        });
      } catch {
        // ignora payload inválido
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  const currentItemIndex = useMemo(() => {
    if (!production?.itens?.length) return -1;
    return production.itens.findIndex((item) => Number(item.atual || 0) === 0);
  }, [production]);

  const weighedCount = useMemo(() => {
    if (!production?.itens?.length) return 0;
    return production.itens.filter((item) => Number(item.atual || 0) > 0).length;
  }, [production]);

  const currentReading = useMemo(() => {
    if (!production?.itens?.length) return 0;

    const activeItem =
      production.itens.find((item) => Number(item.atual || 0) > 0) ||
      production.itens[0];

    return Number(activeItem?.atual || 0);
  }, [production]);

  async function handleConcludeProduction() {
    if (!production?.id) return;

    setSaving(true);

    try {
      await concluirProducao(production.id);
      showSnackbar("Produção concluída com sucesso.", "success");
      await loadActiveProduction();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelProduction() {
    if (!production?.id) return;

    setSaving(true);

    try {
      await cancelarProducao(production.id);
      showSnackbar("Produção cancelada com sucesso.", "success");
      await loadActiveProduction();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Paper
          sx={{
            borderRadius: "20px",
            p: 3,
            background:
              "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(43,130,255,0.06) 100%)",
          }}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: "text.primary", mb: 0.8 }}>
            Aba da Máquina
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Acompanhe a pesagem em tempo real com integração IoT.
          </Typography>
        </Paper>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {loading ? (
          <AppLoading message="Carregando produção ativa..." />
        ) : !production ? (
          <Paper
            sx={{
              minHeight: 240,
              borderRadius: "20px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Typography color="text.secondary">
              Nenhuma produção ativa encontrada.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ borderRadius: "20px", p: 3, height: "100%" }}>
                <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: 18, mb: 2 }}>
                  Leitura Atual
                </Typography>

                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4F46E5 0%, #2E33FF 50%, #2B82FF 100%)",
                    display: "grid",
                    placeItems: "center",
                    color: "#FFF",
                    mx: "auto",
                    mb: 3,
                    boxShadow: "0 18px 40px rgba(46, 51, 255, 0.28)",
                  }}
                >
                  <Stack alignItems="center" spacing={0.5}>
                    <ScaleOutlinedIcon sx={{ fontSize: 34 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: 28 }}>
                      {formatWeight(currentReading)}
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={1.4}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "text.secondary" }}>Fórmula</Typography>
                    <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                      {production.formulaCodigo || "-"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "text.secondary" }}>Protocolo</Typography>
                    <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                      {protocolLabel}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "text.secondary" }}>Última leitura</Typography>
                    <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                      {timestamp}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "text.secondary" }}>Status</Typography>
                    <Chip
                      size="small"
                      label={production.status}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "primary.light",
                        color: "primary.main",
                        border: "1px solid",
                        borderColor: "primary.light",
                      }}
                    />
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                  }}
                >
                  <Paper variant="outlined" sx={{ borderRadius: "16px", p: 2, textAlign: "center" }}>
                    <Inventory2OutlinedIcon sx={{ color: "primary.main", mb: 0.8 }} />
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                      Itens pesados
                    </Typography>
                    <Typography sx={{ color: "text.primary", fontWeight: 800, fontSize: 20 }}>
                      {weighedCount}
                    </Typography>
                  </Paper>

                  <Paper variant="outlined" sx={{ borderRadius: "16px", p: 2, textAlign: "center" }}>
                    <HourglassEmptyOutlinedIcon sx={{ color: "warning.main", mb: 0.8 }} />
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                      Restantes
                    </Typography>
                    <Typography sx={{ color: "text.primary", fontWeight: 800, fontSize: 20 }}>
                      {Math.max((production.itens?.length || 0) - weighedCount, 0)}
                    </Typography>
                  </Paper>
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircleOutlineOutlinedIcon />}
                    onClick={handleConcludeProduction}
                    disabled={saving}
                  >
                    Concluir
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={handleCancelProduction}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Paper sx={{ borderRadius: "20px", overflow: "hidden" }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: 18, mb: 0.5 }}>
                    {production.formulaNome}
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    Acompanhamento de pesagem por componente
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5, display: "grid", gap: 2 }}>
                  {production.itens
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((item, index) => {
                      const diff = getDifference(item.atual, item.alvo);
                      const status =
                        Number(item.atual || 0) > 0
                          ? getStatusByDifference(diff, 5)
                          : "idle";

                      const isActive =
                        currentItemIndex === -1
                          ? index === production.itens.length - 1
                          : index === currentItemIndex - 1 ||
                            (currentItemIndex === 0 && index === 0);

                      return (
                        <Paper
                          key={item.id}
                          variant="outlined"
                          sx={{
                            borderRadius: "16px",
                            p: 2,
                            borderColor:
                              status === "success"
                                ? "success.light"
                                : status === "warning"
                                ? "warning.light"
                                : status === "danger"
                                ? "error.light"
                                : "divider",
                            backgroundColor:
                              status === "success"
                                ? "success.light"
                                : status === "warning"
                                ? "warning.light"
                                : status === "danger"
                                ? "error.light"
                                : "background.paper",
                          }}
                        >
                          <Stack spacing={1.2}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", md: "center" }}
                              spacing={1}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: 16, color: "text.primary" }}>
                                  {item.nome}
                                </Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                                  Etapa {index + 1} de {production.itens.length}
                                </Typography>
                              </Box>

                              {Number(item.atual || 0) > 0 ? (
                                <Box sx={{ textAlign: "right" }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      fontSize: 18,
                                      color:
                                        status === "success"
                                          ? "success.main"
                                          : status === "warning"
                                          ? "warning.main"
                                          : "error.main",
                                    }}
                                  >
                                    {formatWeight(item.atual)}
                                  </Typography>
                                  <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                                    Meta: {formatWeight(item.alvo)}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                                  Aguardando pesagem • Meta: {formatWeight(item.alvo)}
                                </Typography>
                              )}
                            </Stack>

                            <LinearProgress
                              variant="determinate"
                              value={
                                item.alvo > 0
                                  ? Math.min((Number(item.atual || 0) / item.alvo) * 100, 100)
                                  : 0
                              }
                              sx={{
                                height: 6,
                                borderRadius: "999px",
                                backgroundColor: "divider",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "primary.main",
                                  borderRadius: "999px",
                                },
                              }}
                            />

                            {Number(item.atual || 0) > 0 ? (
                              <Chip
                                label={`${getStatusLabel(status)} (${diff >= 0 ? "+" : ""}${diff.toFixed(1)}g)`}
                                size="small"
                                sx={{
                                  alignSelf: "flex-start",
                                  fontWeight: 700,
                                  color:
                                    status === "success"
                                      ? "success.main"
                                      : status === "warning"
                                      ? "warning.main"
                                      : "error.main",
                                  backgroundColor:
                                    status === "success"
                                      ? "success.light"
                                      : status === "warning"
                                      ? "warning.light"
                                      : "error.light",
                                  border: "1px solid",
                                  borderColor:
                                    status === "success"
                                      ? "success.light"
                                      : status === "warning"
                                      ? "warning.light"
                                      : "error.light",
                                }}
                              />
                            ) : isActive ? (
                              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                                Componente atual da pesagem.
                              </Typography>
                            ) : null}
                          </Stack>
                        </Paper>
                      );
                    })}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Stack>
    </AdminLayout>
  );
}