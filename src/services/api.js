const API_BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "gestor_tintas_token";

export async function loginRequest({ email, senha }) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar com a API. Verifique se o backend está rodando e se o CORS está liberado."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      (response.status === 401
        ? "Credenciais inválidas. Verifique e-mail e senha."
        : "Não foi possível realizar o login.");

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function authFetch(path, options = {}) {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  return response;
}