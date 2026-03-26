import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail/ProblemDetail";
import {
  createCategoriaProduto,
  deleteCategoriaProduto,
  getCategoriasProdutos,
  updateCategoriaProduto,
} from "../../services/api";

const INITIAL_FORM = {
  nome: "",
  descricao: "",
};

function normalizeCategoria(item) {
  return {
    id: item?.id,
    nome: item?.nome || "-",
    descricao: item?.descricao || "-",
  };
}

export default function CategoriesPage() {
  const { showSnackbar } = useAppSnackbar();

  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadCategorias() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getCategoriasProdutos();
      const normalized = Array.isArray(data) ? data.map(normalizeCategoria) : [];
      setCategorias(normalized);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return categorias;

    return categorias.filter((categoria) => {
      return (
        String(categoria.nome || "").toLowerCase().includes(term) ||
        String(categoria.descricao || "").toLowerCase().includes(term)
      );
    });
  }, [categorias, search]);

  function openCreate() {
    setEditingCategory(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(categoria) {
    setEditingCategory(categoria);
    setForm({
      nome: categoria.nome || "",
      descricao: categoria.descricao || "",
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingCategory(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.nome.trim()) {
      errors.nome = "Informe o nome da categoria.";
    }

    if (!form.descricao.trim()) {
      errors.descricao = "Informe a descrição da categoria.";
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

    setSaving(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
      };

      if (editingCategory) {
        await updateCategoriaProduto(editingCategory.id, payload);
        showSnackbar("Categoria atualizada com sucesso.", "success");
      } else {
        await createCategoriaProduto(payload);
        showSnackbar("Categoria cadastrada com sucesso.", "success");
      }

      closeDialog();
      await loadCategorias();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(categoria) {
    const confirmed = window.confirm(
      `Deseja excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCategoriaProduto(categoria.id);
      showSnackbar("Categoria excluída com sucesso.", "success");
      await loadCategorias();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  return (
    <AdminLayout>
      <Paper
        sx={{
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
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
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0B1739",
                  mb: 0.5,
                }}
              >
                Categorias de Produtos
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Cadastre, edite e exclua categorias de produto
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
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
              Nova Categoria
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar por nome ou descrição..."
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
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              px: 3,
              py: 4,
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando categorias...
              </Typography>
            </Stack>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMessage}</Alert>
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
                  <TableCell>Categoria</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categoriasFiltradas.map((categoria) => (
                  <TableRow
                    key={categoria.id}
                    hover
                    sx={{
                      "& td": {
                        borderColor: "#E5E7EB",
                        py: 1.4,
                      },
                    }}
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
                          <CategoryOutlinedIcon fontSize="small" />
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: 15,
                          }}
                        >
                          {categoria.nome}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {categoria.descricao}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlinedIcon fontSize="small" />}
                          onClick={() => openEdit(categoria)}
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            color: "#111827",
                            borderColor: "#D1D5DB",
                            fontWeight: 600,
                            px: 1.8,
                            minWidth: "auto",
                          }}
                        >
                          Editar
                        </Button>

                        <IconButton
                          sx={{ color: "#DC2626" }}
                          onClick={() => handleDelete(categoria)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />

            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Exibindo {categoriasFiltradas.length} categorias cadastradas
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingCategory ? "Editar Categoria" : "Cadastrar Categoria"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome da Categoria"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                error={Boolean(fieldErrors.nome)}
                helperText={fieldErrors.nome}
                fullWidth
              />

              <TextField
                label="Descrição"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                required
                error={Boolean(fieldErrors.descricao)}
                helperText={fieldErrors.descricao}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingCategory
                ? "Salvar alterações"
                : "Cadastrar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AdminLayout>
  );
}