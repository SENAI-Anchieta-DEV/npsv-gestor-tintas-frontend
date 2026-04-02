const API_BASE_URL = "http://localhost:8080";

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function storeToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

function buildErrorMessage(data, response) {
  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (
      firstKey &&
      Array.isArray(data.errors[firstKey]) &&
      data.errors[firstKey][0]
    ) {
      return data.errors[firstKey][0];
    }
  }

  if (data?.detail) return data.detail;
  if (data?.title) return data.title;
  if (data?.message) return data.message;
  if (typeof data === "string" && data.trim()) return data;

  return `Erro na requisição: ${response.status}`;
}

export async function loginRequest(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      senha: credentials.senha,
    }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(buildErrorMessage(data, response));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function authenticatedRequest(path, options = {}) {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(buildErrorMessage(data, response));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ===================== AUTH ===================== */

export function logout() {
  removeToken();
}

/* ===================== USUÁRIOS ===================== */

export function getUsuarios() {
  return authenticatedRequest("/api/usuarios", {
    method: "GET",
  });
}

export function createUsuario(payload) {
  return authenticatedRequest("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUsuario(email, payload) {
  return authenticatedRequest(`/api/usuarios/email/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUsuario(email) {
  return authenticatedRequest(`/api/usuarios/email/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

/* ===================== CATEGORIAS DE PRODUTO ===================== */

export function getCategoriasProdutos() {
  return authenticatedRequest("/api/categorias-produtos", {
    method: "GET",
  });
}

export function createCategoriaProduto(payload) {
  return authenticatedRequest("/api/categorias-produtos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategoriaProduto(id, payload) {
  return authenticatedRequest(`/api/categorias-produtos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCategoriaProduto(id) {
  return authenticatedRequest(`/api/categorias-produtos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/* ===================== PRODUTOS ===================== */

export function getProdutos() {
  return authenticatedRequest("/api/produtos", {
    method: "GET",
  });
}

export function getProdutoById(id) {
  return authenticatedRequest(`/api/produtos/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function createProduto(payload) {
  return authenticatedRequest("/api/produtos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduto(id, payload) {
  return authenticatedRequest(`/api/produtos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduto(id) {
  return authenticatedRequest(`/api/produtos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/* ===================== FÓRMULAS ===================== */

export function getFormulas() {
  return authenticatedRequest("/api/formulas", {
    method: "GET",
  });
}

export function getFormulaById(id) {
  return authenticatedRequest(`/api/formulas/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function createFormula(payload) {
  return authenticatedRequest("/api/formulas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateFormula(id, payload) {
  return authenticatedRequest(`/api/formulas/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteFormula(id) {
  return authenticatedRequest(`/api/formulas/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/* ===================== VENDAS ===================== */

export function getVendas() {
  return authenticatedRequest("/api/vendas", {
    method: "GET",
  });
}

export function getVendaById(id) {
  return authenticatedRequest(`/api/vendas/id/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function getVendasByVendedor(vendedorId) {
  return authenticatedRequest(`/api/vendas/vendedor/${encodeURIComponent(vendedorId)}`, {
    method: "GET",
  });
}

/* ===================== PRODUÇÕES ===================== */

export function getProducoes() {
  return authenticatedRequest("/api/producoes", {
    method: "GET",
  });
}

export function getProducaoById(id) {
  return authenticatedRequest(`/api/producoes/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}