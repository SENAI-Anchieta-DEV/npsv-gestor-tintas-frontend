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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          borderRadius: { xs: "16px", md: "20px" },
          border: "1px solid",
          borderColor: "divider",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(0,0,0,0.28)"
              : "0 4px 18px rgba(15,23,42,0.05)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 17, md: 18 },
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 0.5,
                }}
              >
                Gestão de Produções
              </Typography>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Inicie, acompanhe e finalize produções no mesmo padrão visual
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                width: { xs: "100%", md: "auto" },
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

        <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por fórmula ou colorista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Colorista"
              value={coloristaFiltro}
              onChange={(e) => setColoristaFiltro(e.target.value)}
              sx={{ minWidth: { xs: "100%", lg: 220 } }}
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
              sx={{ minWidth: { xs: "100%", lg: 180 } }}
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
              sx={{ minWidth: { xs: "100%", lg: 170 } }}
            />

            <TextField
              label="Data final"
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: "100%", lg: 170 } }}
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
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : producoesFiltradas.length === 0 ? (
          <Box sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
              Nenhuma produção encontrada
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Inicie uma nova produção ou ajuste os filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        fontSize: 14,
                        color: "text.secondary",
                        fontWeight: 700,
                        backgroundColor: "background.paper",
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
                      <TableRow
                        key={producao.id}
                        hover
                        sx={{ "& td": { borderColor: "divider", py: 1.4 } }}
                      >
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
                                flexShrink: 0,
                              }}
                            >
                              <PrecisionManufacturingOutlinedIcon fontSize="small" />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "text.primary",
                                  fontSize: 15,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {producao.formula?.nomeCor || "Fórmula não informada"}
                              </Typography>
                              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                                {producao.formula?.codigoInterno || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                          {formatDateTime(producao.dataHora)}
                        </TableCell>

                        <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
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
            </Box>

            <Divider />
            <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Exibindo {producoesFiltradas.length} produção(ões)
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={closeCreateDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
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

          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              flexDirection: { xs: "column-reverse", sm: "row" },
              gap: 1,
            }}
          >
            <Button
              onClick={closeCreateDialog}
              disabled={saving}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {saving ? "Salvando..." : "Iniciar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
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

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              color="error"
              onClick={() => handleAction("cancelar")}
              disabled={actionLoading || !selectedProducao}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancelar
            </Button>

            <Button
              color="warning"
              onClick={() => handleAction("perda")}
              disabled={actionLoading || !selectedProducao}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Perda total
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              onClick={() => setDetailOpen(false)}
              disabled={actionLoading}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Fechar
            </Button>
            <Button
              variant="contained"
              onClick={() => handleAction("concluir")}
              disabled={actionLoading || !selectedProducao}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {actionLoading ? "Processando..." : "Concluir"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}