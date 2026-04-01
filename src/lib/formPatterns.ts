export function validateRequired(value: string, message: string) {
  return value.trim() ? "" : message;
}

export function validateEmail(value: string) {
  if (!value.trim()) return "Informe o e-mail.";
  if (!/\S+@\S+\.\S+/.test(value)) return "Informe um e-mail válido.";
  return "";
}