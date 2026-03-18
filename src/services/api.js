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
    throw error;
  }

  return data;
}

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