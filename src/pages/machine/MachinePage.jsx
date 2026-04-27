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
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  cancelProduction,
  concludeProduction,
  getActiveProduction,
} from "../../services/api";

const COLORS = {
  border: "#E5E7EB",
  text: "#0B1739",
  textSoft: "#6B7280",
  primary: "#2E33FF",
  success: "#22C55E",
  warning: "#FACC15",
  danger: "#EF4444",
};

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

  if (abs <= tolerance) {
    return "success";
  }

  if (abs <= tolerance + 5) {
    return "warning";
  }

  return "danger";
}

function getStatusLabel(status) {
  if (status === "success") return "Dentro da margem";
  if (status === "warning") return "Aproximação";
  return "Erro de dosagem";
}

function getStatusStyles(status) {
  if (status === "success") {
    return {
      color: COLORS.success,
      border: `1px solid ${COLORS.success}33`,
      backgroundColor: `${COLORS.success}12`,
    };
  }

  if (status === "warning") {
    return {
      color: "#D4A300",
      border: "1px solid rgba(250, 204, 21, 0.45)",
      backgroundColor: "rgba(250, 204, 21, 0.10)",
    };
  }

  return {
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}33`,
    backgroundColor: `${COLORS.danger}12`,
  };
}

function normalizeProduction(data) {
  const itens = Array.isArray(data?.itens || data?.componentes)
    ? data.itens || data.componentes
    : [];

  return {
    id: data?.id,
    formulaNome: data?.formulaNome || data?.formula?.nome || "Fórmula ativa",
    formulaCodigo: data?.formulaCodigo || data?.formula?.codigo || "",
    status: data?.status || "PROCESSANDO",
    itens: itens.map((item, index) => ({
      id: item?.id || `${index}`,
      nome:
        item?.nomeProduto ||
        item?.produtoNome ||
        item?.nome ||
        `Item ${index + 1}`,
      alvo: Number(item?.pesoAlvo || item?.quantidadeAlvo || item?.alvo || 0),
      atual: Number(item?.pesoAtual || 0),
      ordem: Number(item?.ordem || index + 1),
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
      const data = await getActiveProduction();
      setProduction(normalizeProduction(data));
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
      await concludeProduction(production.id);
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
      await cancelProduction(production.id);
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
      <Box sx={{ display: "grid", gap: 3 }}>
        <Paper
          sx={{
            borderRadius: "18px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            p: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: COLORS.text,
                  mb: 0.5,
                }}
              >
                Aba da Máquina IoT
              </Typography>
              <Typography sx={{ color: COLORS.textSoft }}>
                Interface de produção em tempo real via ESP32 + MQTT
              </Typography>
            </Box>

            <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={0.5}>
              <Typography sx={{ color: COLORS.textSoft, fontSize: 12 }}>
                Status da Conexão
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WifiOutlinedIcon
                  sx={{
                    color:
                      connectionStatus === "Conectado"
                        ? COLORS.success
                        : COLORS.warning,
                    fontSize: 18,
                  }}
                />
                <Typography
                  sx={{
                    color:
                      connectionStatus === "Conectado"
                        ? COLORS.success
                        : COLORS.text,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {connectionStatus}
                </Typography>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor:
                      connectionStatus === "Conectado"
                        ? COLORS.success
                        : COLORS.warning,
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {errorMessage ? (
          <Alert severity="error" sx={{ borderRadius: "14px" }}>
            {errorMessage}
          </Alert>
        ) : null}

        {loading ? (
          <Paper
            sx={{
              minHeight: 240,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando produção ativa...
              </Typography>
            </Stack>
          </Paper>
        ) : !production ? (
          <Paper
            sx={{
              minHeight: 240,
              borderRadius: "18px",
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
              <Paper
                sx={{
                  borderRadius: "18px",
                  border: `1px solid ${COLORS.border}`,
                  p: 3,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    textAlign: "center",
                    fontWeight: 800,
                    color: COLORS.text,
                    fontSize: 18,
                    mb: 2,
                  }}
                >
                  Leitura Atual
                </Typography>

                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #4F46E5 0%, #2E33FF 50%, #2B82FF 100%)",
                    display: "grid",
                    placeItems: "center",
                    color: "#FFF",
                    mx: "auto",
                    mb: 2.5,
                    boxShadow: "0 20px 35px rgba(46, 51, 255, 0.25)",
                  }}
                >
                  <Stack alignItems="center" spacing={0.5}>
                    <ScaleOutlinedIcon sx={{ fontSize: 34 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
                      {formatWeight(currentReading)}
                    </Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
                      gramas
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={1.5}>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: "14px",
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography sx={{ color: COLORS.textSoft, fontSize: 12 }}>
                      Timestamp
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: COLORS.text }}>
                      {timestamp}
                    </Typography>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: "14px",
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography sx={{ color: COLORS.textSoft, fontSize: 12 }}>
                      Protocolo
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: COLORS.primary }}>
                      {protocolLabel}
                    </Typography>
                  </Paper>

                  <Button
                    variant="outlined"
                    startIcon={<HourglassEmptyOutlinedIcon />}
                    disabled
                    sx={{ borderRadius: "14px", py: 1.2 }}
                  >
                    Pesando...
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={handleCancelProduction}
                    disabled={saving}
                    sx={{ borderRadius: "14px", py: 1.2 }}
                  >
                    Cancelar Produção
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Paper
                sx={{
                  borderRadius: "18px",
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#EEF2FF",
                        color: COLORS.primary,
                      }}
                    >
                      <Inventory2OutlinedIcon fontSize="small" />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{ fontWeight: 800, fontSize: 18, color: COLORS.text }}
                      >
                        Fórmula Selecionada
                      </Typography>
                      <Typography sx={{ color: COLORS.textSoft, fontSize: 14 }}>
                        {production.formulaNome}
                        {production.formulaCodigo
                          ? ` • ${production.formulaCodigo}`
                          : ""}
                      </Typography>
                    </Box>
                  </Stack>

                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 2.5,
                      borderRadius: "14px",
                      p: 2,
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography sx={{ color: COLORS.textSoft, fontSize: 12, mb: 1 }}>
                      Progresso da Produção
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={
                        production.itens.length
                          ? (weighedCount / production.itens.length) * 100
                          : 0
                      }
                      sx={{
                        height: 8,
                        borderRadius: "999px",
                        backgroundColor: "#E5E7EB",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: COLORS.primary,
                          borderRadius: "999px",
                        },
                      }}
                    />

                    <Typography sx={{ mt: 1.5, fontWeight: 700, color: COLORS.text }}>
                      {weighedCount} de {production.itens.length} pigmentos pesados
                    </Typography>
                  </Paper>
                </Box>

                <Divider />

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
                                ? `${COLORS.success}55`
                                : status === "warning"
                                ? "rgba(250,204,21,0.55)"
                                : status === "danger"
                                ? `${COLORS.danger}55`
                                : COLORS.border,
                            backgroundColor:
                              status === "success"
                                ? `${COLORS.success}08`
                                : status === "warning"
                                ? "rgba(250,204,21,0.08)"
                                : status === "danger"
                                ? `${COLORS.danger}08`
                                : "#FFFFFF",
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
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: 16,
                                    color: COLORS.text,
                                  }}
                                >
                                  {item.nome}
                                </Typography>
                                <Typography sx={{ color: COLORS.textSoft, fontSize: 13 }}>
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
                                          ? COLORS.success
                                          : status === "warning"
                                          ? "#D4A300"
                                          : COLORS.danger,
                                    }}
                                  >
                                    {formatWeight(item.atual)}
                                  </Typography>
                                  <Typography sx={{ color: COLORS.textSoft, fontSize: 12 }}>
                                    Meta: {formatWeight(item.alvo)}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography sx={{ color: COLORS.textSoft, fontSize: 13 }}>
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
                                backgroundColor: "#E5E7EB",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: COLORS.primary,
                                  borderRadius: "999px",
                                },
                              }}
                            />

                            {Number(item.atual || 0) > 0 ? (
                              <Chip
                                label={`${getStatusLabel(status)} (${diff >= 0 ? "+" : ""}${diff.toFixed(
                                  1
                                )}g)`}
                                size="small"
                                sx={{
                                  alignSelf: "flex-start",
                                  fontWeight: 700,
                                  ...getStatusStyles(status),
                                }}
                              />
                            ) : isActive ? (
                              <Typography sx={{ color: COLORS.textSoft, fontSize: 13 }}>
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

            <Grid item xs={12}>
              <Paper
                sx={{
                  borderRadius: "18px",
                  border: `1px solid ${COLORS.border}`,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 800, color: COLORS.text, mb: 2 }}>
                  Indicadores Visuais
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: COLORS.success,
                        }}
                      />
                      <Typography sx={{ color: COLORS.textSoft, fontSize: 14 }}>
                        Dentro da margem (±5g)
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: COLORS.warning,
                        }}
                      />
                      <Typography sx={{ color: COLORS.textSoft, fontSize: 14 }}>
                        Aproximação
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: COLORS.danger,
                        }}
                      />
                      <Typography sx={{ color: COLORS.textSoft, fontSize: 14 }}>
                        Erro de dosagem
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: COLORS.primary,
                        }}
                      />
                      <Typography sx={{ color: COLORS.textSoft, fontSize: 14 }}>
                        Em processo
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  startIcon={<CheckCircleOutlineOutlinedIcon />}
                  onClick={handleConcludeProduction}
                  disabled={saving || !production?.id}
                  sx={{
                    borderRadius: "14px",
                    py: 1.2,
                    px: 2.5,
                    fontWeight: 800,
                    bgcolor: COLORS.primary,
                    "&:hover": {
                      bgcolor: "#1F28D9",
                    },
                  }}
                >
                  Confirmar Produção Concluída
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </AdminLayout>
  );
}