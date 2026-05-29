import { useEffect, useMemo, useState } from "react";
import { Alert, Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createCategoriaProduto,
  deleteCategoriaProduto,
  getCategoriasProdutos,
  updateCategoriaProduto,
} from "../../services/api";

const INITIAL_FORM = {
  id: "",
  nome: "",
  descricao: "",
};

function normalizeCategoria(item) {
  return {
    id: item?.id || "",
    nome: item?.nome || "",
    descricao: item?.descricao || "",
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
  const [editingId, setEditingId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

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

  const filteredCategorias = useMemo(() => {
    const term = search.trim().toLowerCase();

    return categorias.filter((categoria) => {
      return (
        !term ||
        categoria.nome.toLowerCase().includes(term) ||
        categoria.descricao.toLowerCase().includes(term)
      );
    });
  }, [categorias, search]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function openCreateDialog() {
    setEditingId("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(categoria) {
    setEditingId(categoria.id);
    setForm({
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingId("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function validateForm() {
    const errors = {};
    if (!String(form.nome).trim()) errors.nome = "Informe o nome.";
    if (!String(form.descricao).trim()) errors.descricao = "Informe a descrição.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      if (editingId) {
        await updateCategoriaProduto(editingId, {
          nome: form.nome,
          descricao: form.descricao,
        });
        showSnackbar("Categoria atualizada com sucesso.", "success");
      } else {
        await createCategoriaProduto({
          nome: form.nome,
          descricao: form.descricao,
        });
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
    try {
      await deleteCategoriaProduto(categoria.id);
      showSnackbar("Categoria removida com sucesso.", "success");
      await loadCategorias();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "nome",
      label: "Categoria",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
          {row.nome}
        </Typography>
      ),
    },
    {
      key: "descricao",
      label: "Descrição",
      render: (row) => (
        <Typography sx={{ color: "text.secondary" }}>
          {row.descricao}
        </Typography>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => openEditDialog(row)}>
            <EditOutlinedIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row)}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Box
        sx={{
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <AppPageHeader
          title="Categorias"
          subtitle="Gerencie as categorias dos produtos."
          actionLabel="Nova categoria"
          actionIcon={<AddIcon />}
          onAction={openCreateDialog}
        />

        <Box sx={{ px: 3, pb: 2 }}>
          {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}

          <AppSearchField
            placeholder="Buscar por nome ou descrição"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ px: 0, py: 0 }}
          />
        </Box>

        {loading ? (
          <AppLoading message="Carregando categorias..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredCategorias}
            emptyMessage="Nenhuma categoria encontrada."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title={editingId ? "Editar categoria" : "Nova categoria"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingId ? "Salvar alterações" : "Cadastrar categoria"}
      >
        <AppTextField
          required
          name="nome"
          label="Nome"
          value={form.nome}
          onChange={handleChange}
          error={Boolean(fieldErrors.nome)}
          helperText={fieldErrors.nome}
        />

        <AppTextField
          required
          name="descricao"
          label="Descrição"
          value={form.descricao}
          onChange={handleChange}
          error={Boolean(fieldErrors.descricao)}
          helperText={fieldErrors.descricao}
          multiline
          minRows={3}
        />
      </AppFormDialog>
    </AdminLayout>
  );
}