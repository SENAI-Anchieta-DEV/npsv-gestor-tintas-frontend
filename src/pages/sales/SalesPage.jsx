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
  IconButton,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail/ProblemDetail";
import {
  concluirVenda,
  getCurrentUserEmailFromToken,
  getProdutos,
  getUsuarios,
  getVendaById,
  getVendas,
  getVendasByVendedor,
  iniciarVenda,
} from "../../services/api";

const INITIAL_ITEM = {
  produtoId: "",
  quantidade: "",
};

const INITIAL_CONCLUDE_FORM = {
  formaPagamento: "PIX",
  itens: [INITIAL_ITEM],
};

const FORMA_PAGAMENTO_OPTIONS = [
  "DINHEIRO",
  "PIX",
  "CARTAO_DEBITO",
  "CARTAO_CREDITO",
  "BOLETO",
  "OUTROS",
];

function normalizeVenda(item) {
  return {
    id: item?.id,
    dataAbertura: item?.dataAbertura || item?.dataHora || null,
    valorTotal: item?.valorTotal ?? 0,
    nomeVendedor: item?.nomeVendedor || "Desconhecido",
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

function normalizeProduto(item) {
  return {
    id: item?.id,
    descricao: item?.descricao || "-",
    precoVenda: item?.precoVenda ?? 0,
    categoria: item?.categoria || null,
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

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function SalesPage() {
  const { showSnackbar } = useAppSnackbar();

  const [vendas, setVendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStart, setSavingStart] = useState(false);
  const [savingConclude, setSavingConclude] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [vendedorFiltro, setVendedorFiltro] = useState("TODOS");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [concludeForm, setConcludeForm] = useState(INITIAL_CONCLUDE_FORM);
  const [concludeErrors, setConcludeErrors] = useState({});

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

  async function loadProdutos() {
    try {
      const data = await getProdutos();
      setProdutos(Array.isArray(data) ? data.map(normalizeProduto) : []);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function loadVendas() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data =
        vendedorFiltro === "TODOS"
          ? await getVendas()
          : await getVendasByVendedor(vendedorFiltro);

      setVendas(Array.isArray(data) ? data.map(normalizeVenda) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
    loadProdutos();
  }, []);

  useEffect(() => {
    loadVendas();
  }, [vendedorFiltro]);

  const vendedores = useMemo(() => {
    return usuarios.filter((u) => u.role === "VENDEDOR" || u.role === "ADMIN");
  }, [usuarios]);

  const vendasFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return vendas.filter((venda) => {
      const matchText =
        !termo ||
        String(venda.nomeVendedor || "").toLowerCase().includes(termo) ||
        String(venda.id || "").toLowerCase().includes(termo);

      const data = venda.dataAbertura ? new Date(venda.dataAbertura) : null;

      const matchInicial =
        !dataInicial || (data && data >= new Date(`${dataInicial}T00:00:00`));

      const matchFinal =
        !dataFinal || (data && data <= new Date(`${dataFinal}T23:59:59`));

      return matchText && matchInicial && matchFinal;
    });
  }, [vendas, search, dataInicial, dataFinal]);

  function openDetailDialog(venda) {
    setSelectedVenda(venda);
    setConcludeForm(INITIAL_CONCLUDE_FORM);
    setConcludeErrors({});
    setDetailDialogOpen(true);
  }

  function closeDetailDialog() {
    if (savingConclude) return;
    setDetailDialogOpen(false);
    setSelectedVenda(null);
    setConcludeForm(INITIAL_CONCLUDE_FORM);
    setConcludeErrors({});
  }

  function handleConcludeChange(event) {
    const { name, value } = event.target;
    setConcludeForm((prev) => ({ ...prev, [name]: value }));
    setConcludeErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleItemChange(index, field, value) {
    setConcludeForm((prev) => {
      const itens = [...prev.itens];
      itens[index] = { ...itens[index], [field]: value };
      return { ...prev, itens };
    });
    setConcludeErrors((prev) => ({ ...prev, itens: "" }));
  }

  function addItem() {
    setConcludeForm((prev) => ({
      ...prev,
      itens: [...prev.itens, { ...INITIAL_ITEM }],
    }));
  }

  function removeItem(index) {
    setConcludeForm((prev) => {
      if (prev.itens.length === 1) return prev;
      return {
        ...prev,
        itens: prev.itens.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function validateConclude() {
    const errors = {};

    if (!concludeForm.formaPagamento) {
      errors.formaPagamento = "Selecione a forma de pagamento.";
    }

    const itensInvalidos = concludeForm.itens.some((item) => {
      return !item.produtoId || item.quantidade === "" || Number(item.quantidade) <= 0;
    });

    if (itensInvalidos) {
      errors.itens = "Preencha corretamente todos os itens da venda.";
    }

    setConcludeErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleNovaVenda() {
    if (!currentUser?.id) {
      showSnackbar("Não foi possível identificar o usuário logado.", "error");
      return;
    }

    setSavingStart(true);

    try {
      await iniciarVenda({
        vendedorId: currentUser.id,
      });

      showSnackbar("Venda iniciada com sucesso.", "success");
      await loadVendas();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSavingStart(false);
    }
  }

  async function handleOpenVenda(vendaId) {
    setDetailLoading(true);
    try {
      const data = await getVendaById(vendaId);
      openDetailDialog(normalizeVenda(data));
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleConcluirVenda(event) {
    event.preventDefault();

    if (!selectedVenda) return;

    if (!validateConclude()) {
      showSnackbar("Revise os dados da conclusão da venda.", "error");
      return;
    }

    setSavingConclude(true);

    try {
      await concluirVenda(selectedVenda.id, {
        formaPagamento: concludeForm.formaPagamento,
        itens: concludeForm.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: Number(item.quantidade),
        })),
      });

      showSnackbar("Venda concluída com sucesso.", "success");
      closeDetailDialog();
      await loadVendas();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSavingConclude(false);
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
                Gestão de Vendas
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Inicie, acompanhe e conclua vendas no mesmo padrão das demais telas
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNovaVenda}
              disabled={savingStart}
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
              {savingStart ? "Salvando..." : "Nova Venda"}
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por vendedor ou ID da venda..."
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
              label="Vendedor"
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="TODOS">Todos os vendedores</MenuItem>
              {vendedores.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </MenuItem>
              ))}
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
              <Typography color="text.secondary">Carregando vendas...</Typography>
            </Stack>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : vendasFiltradas.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>
              Nenhuma venda encontrada
            </Typography>
            <Typography sx={{ color: "#6B7280" }}>
              Inicie uma nova venda ou ajuste os filtros.
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
                  <TableCell>Venda</TableCell>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell>Itens</TableCell>
                  <TableCell>Valor Total</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {vendasFiltradas.map((venda) => (
                  <TableRow key={venda.id} hover sx={{ "& td": { borderColor: "#E5E7EB", py: 1.4 } }}>
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
                          <PointOfSaleOutlinedIcon fontSize="small" />
                        </Box>

                        <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
                          {venda.id}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatDateTime(venda.dataAbertura)}
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {venda.nomeVendedor}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${venda.itens.length} item(ns)`}
                        sx={{
                          height: 28,
                          fontWeight: 700,
                          borderRadius: "999px",
                          color: "#4F46E5",
                          backgroundColor: "#EEF2FF",
                          border: "1px solid #C7D2FE",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatMoney(venda.valorTotal)}
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                        onClick={() => handleOpenVenda(venda.id)}
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
                ))}
              </TableBody>
            </Table>

            <Divider />
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Exibindo {vendasFiltradas.length} venda(s)
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={detailDialogOpen} onClose={closeDetailDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>Detalhe / Conclusão da Venda</DialogTitle>
        <Box component="form" onSubmit={handleConcluirVenda}>
          <DialogContent>
            {detailLoading || !selectedVenda ? (
              <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="ID da Venda"
                    value={selectedVenda.id}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    label="Data/Hora"
                    value={formatDateTime(selectedVenda.dataAbertura)}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Vendedor"
                    value={selectedVenda.nomeVendedor}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Forma de Pagamento"
                    name="formaPagamento"
                    value={concludeForm.formaPagamento}
                    onChange={handleConcludeChange}
                    required
                    error={Boolean(concludeErrors.formaPagamento)}
                    helperText={concludeErrors.formaPagamento}
                    fullWidth
                  >
                    {FORMA_PAGAMENTO_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.replaceAll("_", " ")}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 800, color: "#111827" }}>
                    Itens da Venda
                  </Typography>

                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addItem}
                    sx={{ borderRadius: "12px", textTransform: "none" }}
                  >
                    Adicionar item
                  </Button>
                </Stack>

                {concludeForm.itens.map((item, index) => (
                  <Paper
                    key={`item-venda-${index}`}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      borderColor: "#E5E7EB",
                      boxShadow: "none",
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 700, color: "#0B1739" }}>
                          Item {index + 1}
                        </Typography>

                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={concludeForm.itens.length === 1}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>

                      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                          select
                          label="Produto"
                          value={item.produtoId}
                          onChange={(e) => handleItemChange(index, "produtoId", e.target.value)}
                          fullWidth
                        >
                          {produtos.map((produto) => (
                            <MenuItem key={produto.id} value={produto.id}>
                              {produto.descricao} — {formatMoney(produto.precoVenda)}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          label="Quantidade"
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}

                {concludeErrors.itens ? <Alert severity="error">{concludeErrors.itens}</Alert> : null}

                {selectedVenda.itens.length > 0 ? (
                  <>
                    <Divider />
                    <Typography sx={{ fontWeight: 800, color: "#111827" }}>
                      Itens já registrados
                    </Typography>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell>Quantidade</TableCell>
                          <TableCell>Preço Unitário</TableCell>
                          <TableCell>Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedVenda.itens.map((item, index) => (
                          <TableRow key={`${item.produtoId}-${index}`}>
                            <TableCell>{item.nomeProduto}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>{formatMoney(item.precoPraticado)}</TableCell>
                            <TableCell>{formatMoney(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : null}
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDetailDialog} disabled={savingConclude}>
              Fechar
            </Button>
            <Button type="submit" variant="contained" disabled={savingConclude || detailLoading}>
              {savingConclude ? "Concluindo..." : "Concluir venda"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AdminLayout>
  );
}