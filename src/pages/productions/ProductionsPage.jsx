import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail/ProblemDetail";
import {
  cancelarProducao,
  concluirProducao,
  getCurrentUserEmailFromToken,
  getFormulas,
  getProducaoById,
  getProducoes,
  getUsuarios,
  iniciarProducao,
  registrarPerdaTotal,
} from "../../services/api";

const INITIAL_FORM = {
  formulaId: "",
};

function normalizeFormula(item) {
  return {
    id: item?.id,
    codigoInterno: item?.codigoInterno || "-",
    nomeCor: item?.nomeCor || "-",
  };
}

function normalizeProducao(item) {
  return {
    id: item?.id,
    dataHora: item?.dataHora || null,
    status: item?.status || "PENDENTE",
    colorista: item?.colorista || null,
    formula: item?.formula || null,
  };
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

function getStatusChip(status) {
  if (status === "CONCLUIDO") {
    return {
      color: "#16A34A",
      backgroundColor: "#F0FDF4",
      border: "1px solid #BBF7D0",
      label: "Concluído",
    };
  }

  if (status === "CANCELADO") {
    return {
      color: "#DC2626",
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      label: "Cancelado",
    };
  }

  if (status === "PERDA_TOTAL") {
    return {
      color: "#B91C1C",
      backgroundColor: "#FEF2F2",
      border: "1px solid #FCA5A5",
      label: "Perda total",
    };
  }

  if (status === "PROCESSANDO") {
    return {
      color: "#D97706",
      backgroundColor: "#FFFBEB",
      border: "1px solid #FDE68A",
      label: "Processando",
    };
  }

  return {
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    border: "1px solid #C7D2FE",
    label: "Pendente",
  };
}

export default function ProductionsPage() {
  const { showSnackbar } = useAppSnackbar();

  const [producoes, setProducoes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [coloristaFiltro, setColoristaFiltro] = useState("TODOS");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProducao, setSelectedProducao] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const [currentUser, setCurrentUser] = useState(null);

  async function loadUsuarios() {
    try {
      const data = await getUsuarios();
      const usuariosData = Array.isArray(data) ? data : [];
      setUsuarios(usuariosData);

      const emailLogado = getCurrentUserEmailFromToken();
      const usuarioLogado = usuariosData.find(
        (u) => String(u.email || "").toLowerCase() === String(emailLogado || "").toLowerCase()
      );

      setCurrentUser(usuarioLogado || null);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function loadFormulas() {
    try {
      const data = await getFormulas();
      setFormulas(Array.isArray(data) ? data.map(normalizeFormula) : []);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function loadProducoes() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getProducoes();
      setProducoes(Array.isArray(data) ? data.map(normalizeProducao) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
    loadFormulas();
    loadProducoes();
  }, []);

  const coloristas = useMemo(() => {
    return usuarios.filter((u) => u.role === "COLORISTA" || u.role === "ADMIN");
  }, [usuarios]);

  const producoesFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return producoes.filter((producao) => {
      const matchText =
        !termo ||
        String(producao.formula?.nomeCor || "").toLowerCase().includes(termo) ||
        String(producao.colorista?.nome || "").toLowerCase().includes(termo);

      const matchColorista =
        coloristaFiltro === "TODOS"
          ? true
          : String(producao.colorista?.id || "") === String(coloristaFiltro);

      const matchStatus =
        statusFiltro === "TODOS" ? true : producao.status === statusFiltro;

      const data = producao.dataHora ? new Date(producao.dataHora) : null;

      const matchInicial =
        !dataInicial || (data && data >= new Date(`${dataInicial}T00:00:00`));

      const matchFinal =
        !dataFinal || (data && data <= new Date(`${dataFinal}T23:59:59`));

      return matchText && matchColorista && matchStatus && matchInicial && matchFinal;
    });
  }, [producoes, search, coloristaFiltro, statusFiltro, dataInicial, dataFinal]);

  function openCreateDialog() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeCreateDialog() {
    if (saving) return;
    setDialogOpen(false);
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.formulaId) {
      errors.formulaId = "Selecione a fórmula.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      showSnackbar("Revise os campos obrigatórios.", "error");
      return;
    }

    if (!currentUser?.id) {
      showSnackbar("Não foi possível identificar o usuário logado.", "error");
      return;
    }

    setSaving(true);

    try {
      await iniciarProducao({
        coloristaId: currentUser.id,
        formulaId: form.formulaId,
      });

      showSnackbar("Produção iniciada com sucesso.", "success");
      closeCreateDialog();
      await loadProducoes();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenDetail(producaoId) {
    setDetailLoading(true);
    try {
      const data = await getProducaoById(producaoId);
      setSelectedProducao(normalizeProducao(data));
      setDetailOpen(true);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAction(action) {
    if (!selectedProducao) return;

    setActionLoading(true);

    try {
      if (action === "concluir") {
        await concluirProducao(selectedProducao.id);
        showSnackbar("Produção concluída com sucesso.", "success");
      }

      if (action === "cancelar") {
        await cancelarProducao(selectedProducao.id);
        showSnackbar("Produção cancelada com sucesso.", "success");
      }

      if (action === "perda") {
        await registrarPerdaTotal(selectedProducao.id);
        showSnackbar("Perda total registrada com sucesso.", "success");
      }

      setDetailOpen(false);
      setSelectedProducao(null);
      await loadProducoes();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminLayout>
      <Paper
        sx={{
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0B1739", mb: 0.5 }}>
                Gestão de Produções
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Inicie, acompanhe e finalize produções no mesmo padrão visual
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                borderRadius: "14px",
                px: 2.2,
                py: 1.1,
                fontWeight: 700,
                background: "linear-gradient(135deg, #4F46E5, #4338CA)",
                boxShadow: "0 8px 20px rgba(79, 70, 229, 0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338CA, #3730A3)",
                },
              }}
            >
              Nova Produção
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por fórmula ou colorista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
                sx: {
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                },
              }}
            />

            <TextField
              select
              label="Colorista"
              value={coloristaFiltro}
              onChange={(e) => setColoristaFiltro(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="TODOS">Todos os coloristas</MenuItem>
              {coloristas.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="PROCESSANDO">Processando</MenuItem>
              <MenuItem value="CONCLUIDO">Concluído</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
              <MenuItem value="PERDA_TOTAL">Perda total</MenuItem>
            </TextField>

            <TextField
              label="Data inicial"
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 170 }}
            />

            <TextField
              label="Data final"
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 170 }}
            />
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ minHeight: 220, display: "grid", placeItems: "center", p: 4 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">Carregando produções...</Typography>
            </Stack>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : producoesFiltradas.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>
              Nenhuma produção encontrada
            </Typography>
            <Typography sx={{ color: "#6B7280" }}>
              Inicie uma nova produção ou ajuste os filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: 700,
                      backgroundColor: "#FFFFFF",
                    },
                  }}
                >
                  <TableCell>Fórmula</TableCell>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Colorista</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {producoesFiltradas.map((producao) => {
                  const statusChip = getStatusChip(producao.status);

                  return (
                    <TableRow key={producao.id} hover sx={{ "& td": { borderColor: "#E5E7EB", py: 1.4 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "12px",
                              backgroundColor: "#EEF2FF",
                              color: "#4F46E5",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <PrecisionManufacturingOutlinedIcon fontSize="small" />
                          </Box>

                          <Box>
                            <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
                              {producao.formula?.nomeCor || "Fórmula não informada"}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#6B7280" }}>
                              {producao.formula?.codigoInterno || "-"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                        {formatDateTime(producao.dataHora)}
                      </TableCell>

                      <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                        {producao.colorista?.nome || "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={statusChip.label}
                          sx={{
                            height: 28,
                            fontWeight: 700,
                            borderRadius: "999px",
                            color: statusChip.color,
                            backgroundColor: statusChip.backgroundColor,
                            border: statusChip.border,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                          onClick={() => handleOpenDetail(producao.id)}
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            color: "#111827",
                            borderColor: "#D1D5DB",
                            fontWeight: 600,
                            px: 1.8,
                          }}
                        >
                          Ver detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Divider />
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Exibindo {producoesFiltradas.length} produção(ões)
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Iniciar Produção</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Colorista responsável"
                value={currentUser?.nome || "Usuário não identificado"}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <TextField
                select
                label="Fórmula"
                name="formulaId"
                value={form.formulaId}
                onChange={handleChange}
                required
                error={Boolean(fieldErrors.formulaId)}
                helperText={fieldErrors.formulaId}
                fullWidth
              >
                {formulas.map((formula) => (
                  <MenuItem key={formula.id} value={formula.id}>
                    {formula.nomeCor} — {formula.codigoInterno}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeCreateDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Iniciar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>Detalhe da Produção</DialogTitle>
        <DialogContent>
          {detailLoading || !selectedProducao ? (
            <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Fórmula"
                  value={selectedProducao.formula?.nomeCor || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Código Interno"
                  value={selectedProducao.formula?.codigoInterno || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Colorista"
                  value={selectedProducao.colorista?.nome || "-"}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Data/Hora"
                  value={formatDateTime(selectedProducao.dataHora)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Status"
                value={selectedProducao.status}
                InputProps={{ readOnly: true }}
                fullWidth
              />

              <Alert severity="info">
                O backend atual não expõe GET de pesagens por produção. Então o detalhe mostra
                fórmula, colorista e status, mas não lista PesagemEventos.
              </Alert>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1}>
            <Button
              color="error"
              onClick={() => handleAction("cancelar")}
              disabled={actionLoading || !selectedProducao}
            >
              Cancelar
            </Button>

            <Button
              color="warning"
              onClick={() => handleAction("perda")}
              disabled={actionLoading || !selectedProducao}
            >
              Perda total
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button onClick={() => setDetailOpen(false)} disabled={actionLoading}>
              Fechar
            </Button>
            <Button
              variant="contained"
              onClick={() => handleAction("concluir")}
              disabled={actionLoading || !selectedProducao}
            >
              {actionLoading ? "Processando..." : "Concluir"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}