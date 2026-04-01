import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Card, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useAppSnackbar } from "../../components/feedback/AppSnackProvider";
import AppTextField from "../../components/common/AppTextField";
import { getProblemDetailMessage } from "../../lib/problemDetail";

const features = [
  {
    icon: "🧪",
    title: "Fórmulas",
    text: "Gerencie receitas e insumos com precisão.",
    color: "#A855F7",
    bg: "#F3E8FF",
  },
  {
    icon: "📦",
    title: "Estoque",
    text: "Controle produtos, categorias e movimentações.",
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    icon: "🏭",
    title: "Produção",
    text: "Acompanhe ordens, pesagens e execução.",
    color: "#EA580C",
    bg: "#FFEDD5",
  },
  {
    icon: "🔐",
    title: "Segurança",
    text: "Rotas protegidas com autenticação JWT.",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
];

const INITIAL_FORM = { email: "", senha: "" };

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { showSnackbar } = useAppSnackbar();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const destination = location.state?.from?.pathname || "/";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.email.trim()) {
      errors.email = "Informe o e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!form.senha.trim()) {
      errors.senha = "Informe a senha.";
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

    try {
      await login({
        email: form.email.trim(),
        senha: form.senha,
      });

      showSnackbar("Login realizado com sucesso.", "success");
      navigate(destination, { replace: true });
    } catch (error) {
      if (error?.status === 401) {
        showSnackbar("Credenciais inválidas. Tente novamente.", "error");
        return;
      }

      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F7FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          minHeight: { xs: "auto", md: 720 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 4.5 },
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 55%, #EEF4FF 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4.5 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #4F46E5, #2563EB)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontSize: 24,
                }}
              >
                🎨
              </Box>

              <Box>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#0B1739", lineHeight: 1.1 }}>
                  Gestor Tintas
                </Typography>
                <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
                  Sistema de produção e controle
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: { xs: 30, sm: 36, md: 44 },
                  fontWeight: 800,
                  lineHeight: 1.12,
                  color: "#0B1739",
                  mb: 2,
                  letterSpacing: "-0.02em",
                }}
              >
                Gestão inteligente
                <br />
                para <Box component="span" sx={{ color: "#2E33FF" }}>tintas e produção</Box>
              </Typography>

              <Typography sx={{ maxWidth: 560, color: "#6B7280", fontSize: 15, lineHeight: 1.75 }}>
                Controle fórmulas, estoque, produção e autenticação de forma moderna, segura e centralizada.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            {features.map((feature) => (
              <Card
                key={feature.title}
                elevation={0}
                sx={{
                  borderRadius: "22px",
                  p: 2,
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFFCC",
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: feature.bg,
                    color: feature.color,
                    fontSize: 20,
                    mb: 1.8,
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography sx={{ fontWeight: 800, color: "#0B1739", mb: 0.6, fontSize: 15 }}>
                  {feature.title}
                </Typography>

                <Typography sx={{ color: "#6B7280", fontSize: 13.5, lineHeight: 1.65 }}>
                  {feature.text}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 4, md: 3.5 }, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
          <Card
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 420,
              borderRadius: "24px",
              p: { xs: 2.5, md: 3 },
              border: "1px solid #E5E7EB",
              boxShadow: "0 14px 34px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 30, fontWeight: 800, color: "#0B1739", mb: 1 }}>
                Entrar
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: 15, lineHeight: 1.8 }}>
                Faça login para acessar as funcionalidades protegidas do sistema.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 1.2 }}>
              <AppTextField
                name="email"
                label="E-mail"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
              />

              <AppTextField
                name="senha"
                label="Senha"
                type="password"
                required
                value={form.senha}
                onChange={handleChange}
                error={Boolean(fieldErrors.senha)}
                helperText={fieldErrors.senha}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: "14px", py: 1.25, mt: 1, fontWeight: 800 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Entrar"}
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
