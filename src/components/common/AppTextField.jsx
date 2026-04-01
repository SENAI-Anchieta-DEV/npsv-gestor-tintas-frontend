import { TextField } from "@mui/material";

export default function AppTextField({
  requiredMessage,
  helperText,
  error,
  InputLabelProps,
  ...props
}) {
  const resolvedHelperText = error ? helperText || requiredMessage : helperText || " ";

  return (
    <TextField
      fullWidth
      size="medium"
      variant="outlined"
      error={Boolean(error)}
      helperText={resolvedHelperText}
      InputLabelProps={{ shrink: true, ...(InputLabelProps || {}) }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
        },
      }}
      {...props}
    />
  );
}
