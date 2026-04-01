import { useEffect, useMemo, useState } from "react";
import { Alert, Box, IconButton, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createCategoriaProduto,
  deleteCategoriaProduto,
  getCategoriasProdutos,
  updateCategoriaProduto,
} from "../../services/api";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

const INITIAL_FORM = { nome: "", descricao: "" };

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
      setCategorias(Array.isArray(data) ? data.map(normalizeCategoria) : []);
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

    return categorias.filter((categoria) =>
      String(categoria.nome || "").toLowerCase().includes(term) ||
      String(categoria.descricao || "").toLowerCase().includes(term)
    );
  }, [categorias, search]);

  function openCreate() {
    setEditingCategory(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(categoria) {
    setEditingCategory(categoria);
    setForm({ nome: categoria.nome || "", descricao: categoria.descricao || "" });
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
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};
    if (!form.nome.trim()) errors.nome = "Informe o nome da categoria.";
    if (!form.descricao.trim()) errors.descricao = "Informe a descrição da categoria.";
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
      const payload = { nome: form.nome.trim(), descricao: form.descricao.trim() };
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
    if (!window.confirm(`Deseja excluir a categoria \"${categoria.nome}\"?`)) return;

    try {
      await deleteCategoriaProduto(categoria.id);
      showSnackbar("Categoria excluída com sucesso.", "success");
      await loadCategorias();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "categoria",
      label: "Categoria",
      render: (categoria) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "14px", display: "grid", placeItems: "center", backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
            <CategoryOutlinedIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>{categoria.nome}</Typography>
        </Box>
      ),
    },
    {
      key: "descricao",
      label: "Descrição",
      render: (categoria) => <Typography sx={{ color: "text.secondary" }}>{categoria.descricao}</Typography>,
    },
    {
      key: "acoes",
      label: "Ações",
      render: (categoria) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton onClick={() => openEdit(categoria)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(categoria)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Paper sx={{ borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)", overflow: "hidden" }}>
        <AppPageHeader
          title="Categorias de Produtos"
          subtitle="Cadastre, edite e exclua categorias de produto"
          actionLabel="Nova Categoria"
          actionIcon={<AddIcon />}
          onAction={openCreate}
        />

        <AppSearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou descrição..."
        />

        {errorMessage ? (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>{errorMessage}</Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando categorias..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={categoriasFiltradas.map((item) => ({ ...item, key: item.id }))}
            emptyMessage="Nenhuma categoria encontrada com os filtros informados."
          />
        )}
      </Paper>

      <AppFormDialog
        open={dialogOpen}
        title={editingCategory ? "Editar categoria" : "Nova categoria"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingCategory ? "Salvar alterações" : "Cadastrar categoria"}
      >
        <AppTextField
          name="nome"
          label="Nome"
          required
          value={form.nome}
          onChange={handleChange}
          error={Boolean(fieldErrors.nome)}
          helperText={fieldErrors.nome}
        />
        <AppTextField
          name="descricao"
          label="Descrição"
          required
          multiline
          minRows={3}
          value={form.descricao}
          onChange={handleChange}
          error={Boolean(fieldErrors.descricao)}
          helperText={fieldErrors.descricao}
        />
      </AppFormDialog>
    </AdminLayout>
  );
}