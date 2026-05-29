import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import { useAuth } from "../../context/AuthContext";
import { useColorMode } from "../../context/ColorModeContext";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import AppTextField from "../../components/common/AppTextField";
import { getProblemDetailMessage } from "../../lib/problemDetail";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const { showSnackbar } = useAppSnackbar();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form);
      showSnackbar("Login realizado com sucesso.", "success");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(43,130,255,0.12), transparent 28%)",
        backgroundColor: "background.default",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: "26px",
          p: 3.5,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #4F46E5, #2B82FF)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
              }}
            >
              <OpacityOutlinedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: "text.primary" }}>
                Gestor Tintas
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Acesso ao sistema
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={toggleColorMode}>
            {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: 28, fontWeight: 800, color: "text.primary", mb: 0.8 }}>
          Entrar
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Faça login para acessar o painel administrativo.
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gap: 0.8,
          }}
        >
          <AppTextField
            name="email"
            label="E-mail"
            value={form.email}
            onChange={handleChange}
            required
          />

          <AppTextField
            name="senha"
            label="Senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.25,
              fontWeight: 800,
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Entrar"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}