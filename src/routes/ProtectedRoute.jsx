import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#F5F7FB",
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography fontWeight={700}>Carregando...</Typography>
        </Paper>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}