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
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail/ProblemDetail";
import {
  getUsuarios,
  getVendaById,
  getVendas,
  getVendasByVendedor,
} from "../../services/api";

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

function normalizeVenda(item) {
  return {
    id: item?.id,
    dataHora: item?.dataHora,
    valorTotal: item?.valorTotal ?? 0,
    nomeVendedor: item?.nomeVendedor || "Desconhecido",
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

export default function SalesHistoryPage() {
  const { showSnackbar } = useAppSnackbar();

  const [vendas, setVendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [vendedorId, setVendedorId] = useState("TODOS");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState(null);

  async function loadUsuarios() {
    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data.filter((u) => u.role === "VENDEDOR") : []);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function loadVendas() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data =
        vendedorId !== "TODOS" ? await getVendasByVendedor(vendedorId) : await getVendas();

      setVendas(Array.isArray(data) ? data.map(normalizeVenda) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    loadVendas();
  }, [vendedorId]);

  const vendasFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return vendas.filter((venda) => {
      const matchText =
        !termo ||
        String(venda.nomeVendedor || "").toLowerCase().includes(termo) ||
        String(venda.id || "").toLowerCase().includes(termo);

      const data = venda.dataHora ? new Date(venda.dataHora) : null;

      const matchInicial =
        !dataInicial || (data && data >= new Date(`${dataInicial}T00:00:00`));

      const matchFinal =
        !dataFinal || (data && data <= new Date(`${dataFinal}T23:59:59`));

      return matchText && matchInicial && matchFinal;
    });
  }, [vendas, search, dataInicial, dataFinal]);

  async function handleOpenDetail(vendaId) {
    setDetailLoading(true);
    try {
      const data = await getVendaById(vendaId);
      setSelectedVenda(normalizeVenda(data));
      setDetailOpen(true);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setDetailLoading(false);
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
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0B1739", mb: 0.5 }}>
            Histórico de Vendas
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            Consulte vendas por período e vendedor
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                sx: { height: 44, borderRadius: "12px", backgroundColor: "#FFFFFF" },
              }}
            />

            <TextField
              select
              label="Vendedor"
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="TODOS">Todos os vendedores</MenuItem>
              {usuarios.map((usuario) => (
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
              Ajuste os filtros para visualizar o histórico.
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
                  <TableRow
                    key={venda.id}
                    hover
                    sx={{ "& td": { borderColor: "#E5E7EB", py: 1.4 } }}
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
                          }}
                        >
                          <PointOfSaleOutlinedIcon fontSize="small" />
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                          {venda.id}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatDateTime(venda.dataHora)}
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
                        onClick={() => handleOpenDetail(venda.id)}
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

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>Detalhe da Venda</DialogTitle>
        <DialogContent>
          {detailLoading || !selectedVenda ? (
            <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="ID" value={selectedVenda.id} InputProps={{ readOnly: true }} fullWidth />
                <TextField
                  label="Data/Hora"
                  value={formatDateTime(selectedVenda.dataHora)}
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
                  label="Valor Total"
                  value={formatMoney(selectedVenda.valorTotal)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Stack>

              <Typography sx={{ fontWeight: 800, color: "#0B1739" }}>Itens da venda</Typography>

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
                    <TableRow key={`${item.nomeProduto}-${index}`}>
                      <TableCell>{item.nomeProduto}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{formatMoney(item.precoPraticado)}</TableCell>
                      <TableCell>{formatMoney(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDetailOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}