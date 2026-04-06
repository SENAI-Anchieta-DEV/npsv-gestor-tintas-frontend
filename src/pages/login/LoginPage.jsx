import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../context/AuthContext";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
          borderRadius: { xs: "22px", md: "28px" },
          overflow: "hidden",
          backgroundColor: "background.paper",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 18px 45px rgba(0, 0, 0, 0.35)"
              : "0 18px 45px rgba(15, 23, 42, 0.08)",
          minHeight: { xs: "auto", md: 720 },
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(180deg, #111827 0%, #0F172A 55%, #0B1120 100%)"
                : "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 55%, #EEF4FF 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: { xs: 3, md: 4.5 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, md: 52 },
                  height: { xs: 48, md: 52 },
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #4F46E5, #2563EB)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                🎨
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 22, md: 24 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.1,
                  }}
                >
                  Gestor Tintas
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Sistema de produção e controle
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                sx={{
                  fontSize: { xs: 28, sm: 34, md: 44 },
                  fontWeight: 800,
                  lineHeight: 1.12,
                  color: "text.primary",
                  mb: 2,
                  letterSpacing: "-0.02em",
                }}
              >
                Gestão inteligente
                <br />
                <Box component="span" sx={{ color: "#2E33FF" }}>
                  para tintas e produção
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 560,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 15 },
                  lineHeight: 1.75,
                }}
              >
                Controle fórmulas, estoque, produção e autenticação de forma moderna, segura e centralizada.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {features.map((feature) => (
              <Card
                key={feature.title}
                elevation={0}
                sx={{
                  borderRadius: "22px",
                  p: { xs: 1.8, md: 2 },
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#FFFFFFCC",
                  boxShadow: "none",
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

                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                    mb: 0.6,
                    fontSize: 15,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: 13.5,
                    lineHeight: 1.65,
                  }}
                >
                  {feature.text}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 3.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.paper",
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 420,
              borderRadius: { xs: "20px", md: "24px" },
              p: { xs: 2.25, sm: 2.75, md: 3 },
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 14px 34px rgba(0,0,0,0.25)"
                  : "0 14px 34px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: { xs: 26, md: 30 },
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                Entrar
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 15 },
                  lineHeight: 1.8,
                }}
              >
                Faça login para acessar as funcionalidades protegidas do sistema.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "grid", gap: 1.2 }}
            >
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
                fullWidth={isMobile}
                sx={{
                  borderRadius: "14px",
                  py: 1.25,
                  mt: 1,
                  fontWeight: 800,
                }}
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