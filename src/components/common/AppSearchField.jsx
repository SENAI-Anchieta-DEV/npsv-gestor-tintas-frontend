import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment } from "@mui/material";
import AppTextField from "./AppTextField";

export default function AppSearchField({ value, onChange, placeholder = "Pesquisar...", sx }) {
  return (
    <Box sx={{ px: 2.5, py: 2, ...(sx || {}) }}>
      <AppTextField
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        helperText=" "
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
