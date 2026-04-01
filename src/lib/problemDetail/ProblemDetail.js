export function getProblemDetailMessage(error) {
  const data = error?.response?.data || error?.data || error;

  if (data?.detail && String(data.detail).trim()) {
    return String(data.detail);
  }

  if (data?.title && String(data.title).trim()) {
    return String(data.title);
  }

  if (data?.message && String(data.message).trim()) {
    return String(data.message);
  }

  if (error?.message && String(error.message).trim()) {
    return String(error.message);
  }

  return "Ocorreu um erro inesperado.";
}