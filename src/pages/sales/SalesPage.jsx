import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
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
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const columns = [
    {
      key: "venda",
      label: "Venda",
      render: (venda) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
              flexShrink: 0,
            }}
          >
            <PointOfSaleOutlinedIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: 14.5,
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {venda.id}
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 13,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {venda.nomeVendedor}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "dataHora",
      label: "Data/Hora",
      render: (venda) => formatDateTime(venda.dataAbertura),
    },
    {
      key: "itens",
      label: "Itens",
      render: (venda) => (
        <Chip
          label={`${venda.itens.length} item(ns)`}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      key: "valorTotal",
      label: "Valor Total",
      render: (venda) => formatMoney(venda.valorTotal),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (venda) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={() => handleOpenVenda(venda.id)}
            aria-label={`Ver detalhes da venda ${venda.id}`}
            size={isMobile ? "medium" : "small"}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

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
              : "0 4px 18px rgba(15, 23, 42, 0.05)",
          overflow: "hidden",
        }}
      >
        <AppPageHeader
          title="Gestão de Vendas"
          subtitle="Inicie, acompanhe e conclua vendas"
          actionLabel="Nova Venda"
          actionIcon={<AddIcon />}
          onAction={handleNovaVenda}
          actionLoading={savingStart}
          actionSx={{
            width: { xs: "100%", md: "auto" },
          }}
          contentSx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        />

        <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2 }}>
          <AppSearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por vendedor ou ID da venda..."
          />
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            pb: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
          }}
        >
          <AppTextField
            select
            label="Vendedor"
            value={vendedorFiltro}
            onChange={(e) => setVendedorFiltro(e.target.value)}
            helperText=" "
          >
            <MenuItem value="TODOS">Todos os vendedores</MenuItem>
            {vendedores.map((usuario) => (
              <MenuItem key={usuario.id} value={usuario.id}>
                {usuario.nome}
              </MenuItem>
            ))}
          </AppTextField>

          <AppTextField
            label="Data inicial"
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText=" "
          />

          <AppTextField
            label="Data final"
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText=" "
          />
        </Box>

        {errorMessage ? (
          <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>
              {errorMessage}
            </Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando vendas..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={vendasFiltradas.map((item) => ({ ...item, key: item.id }))}
            emptyMessage="Nenhuma venda encontrada."
            containerSx={{
              px: { xs: 1.5, md: 2.5 },
              pb: { xs: 2, md: 2.5 },
            }}
            tableWrapperSx={{
              overflowX: "auto",
            }}
            tableSx={{
              minWidth: 760,
            }}
          />
        )}
      </Paper>

      <AppFormDialog
        open={detailDialogOpen}
        title="Detalhe / Conclusão da Venda"
        onClose={closeDetailDialog}
        onSubmit={handleConcluirVenda}
        loading={savingConclude}
        submitLabel="Concluir venda"
        fullScreen={isMobile}
        dialogProps={{
          maxWidth: "md",
          fullWidth: true,
        }}
        actionsSx={{
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}
        submitButtonSx={{
          width: { xs: "100%", sm: "auto" },
        }}
        cancelButtonSx={{
          width: { xs: "100%", sm: "auto" },
        }}
        contentSx={{
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
        }}
      >
        {detailLoading || !selectedVenda ? (
          <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}>
            <AppLoading message="Carregando venda..." />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <AppTextField
              label="ID da venda"
              value={selectedVenda.id}
              InputProps={{ readOnly: true }}
            />

            <AppTextField
              label="Data/Hora"
              value={formatDateTime(selectedVenda.dataAbertura)}
              InputProps={{ readOnly: true }}
            />

            <AppTextField
              label="Vendedor"
              value={selectedVenda.nomeVendedor}
              InputProps={{ readOnly: true }}
            />

            <AppTextField
              select
              label="Forma de pagamento"
              name="formaPagamento"
              value={concludeForm.formaPagamento}
              onChange={handleConcludeChange}
              required
              error={Boolean(concludeErrors.formaPagamento)}
              helperText={concludeErrors.formaPagamento}
            >
              {FORMA_PAGAMENTO_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </MenuItem>
              ))}
            </AppTextField>

            <Box sx={{ pt: 0.5 }}>
              <Typography sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                Itens da venda
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
                Adicione os produtos e quantidades.
              </Typography>

              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addItem}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  mb: 2,
                }}
              >
                Adicionar item
              </Button>

              <Box sx={{ display: "grid", gap: 2 }}>
                {concludeForm.itens.map((item, index) => (
                  <Paper
                    key={`item-venda-${index}`}
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      borderRadius: "16px",
                      borderColor: "divider",
                      boxShadow: "none",
                    }}
                  >
                    <Box sx={{ display: "grid", gap: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: { xs: "stretch", sm: "center" },
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                          Item {index + 1}
                        </Typography>

                        <Button
                          type="button"
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={concludeForm.itens.length === 1}
                          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
                        >
                          Remover
                        </Button>
                      </Box>

                      <AppTextField
                        select
                        label="Produto"
                        value={item.produtoId}
                        onChange={(e) => handleItemChange(index, "produtoId", e.target.value)}
                      >
                        {produtos.map((produto) => (
                          <MenuItem key={produto.id} value={produto.id}>
                            {produto.descricao} — {formatMoney(produto.precoVenda)}
                          </MenuItem>
                        ))}
                      </AppTextField>

                      <AppTextField
                        label="Quantidade"
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>

              {concludeErrors.itens ? (
                <Alert severity="error" sx={{ mt: 2, borderRadius: "14px" }}>
                  {concludeErrors.itens}
                </Alert>
              ) : null}
            </Box>
          </Box>
        )}
      </AppFormDialog>
    </AdminLayout>
  );
}