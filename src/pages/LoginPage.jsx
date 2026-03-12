import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function LoginPage() {
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!form.email.trim() || !form.senha.trim()) {
      setErrorMessage("Preencha e-mail e senha para continuar.");
      return;
    }

    try {
      await login(form);

      setShowSuccessPopup(true);

      setForm({
        email: "",
        senha: "",
      });

      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2500);
    } catch (error) {
      if (error.status === 401) {
        setErrorMessage("Credenciais inválidas. Tente novamente.");
        return;
      }

      setErrorMessage(error.message || "Erro ao realizar login.");
    }
  }

  return (
    <main className="login-page">
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-icon">✓</div>
          <div className="success-popup-text">
            <strong>Login realizado com sucesso</strong>
            <span>Seu acesso foi autenticado.</span>
          </div>
        </div>
      )}

      <section className="login-layout">
        <div className="login-left">
          <div className="brand-header">
            <div className="brand-icon">🎨</div>
            <div className="brand-text">
              <h2>Gestor Tintas</h2>
              <span>Sistema de produção e controle</span>
            </div>
          </div>

          <div className="hero-content">
            <h1>
              Gestão inteligente
              <br />
              para <span>tintas e produção</span>
            </h1>
            <p>
              Controle fórmulas, estoque, produção e autenticação de forma
              moderna, segura e centralizada.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon purple">🧪</div>
              <strong>Fórmulas</strong>
              <p>Gerencie receitas e insumos com precisão.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">📦</div>
              <strong>Estoque</strong>
              <p>Controle produtos, categorias e movimentações.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">🏭</div>
              <strong>Produção</strong>
              <p>Acompanhe ordens, pesagens e execução.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">🔐</div>
              <strong>Segurança</strong>
              <p>Rotas protegidas com autenticação JWT.</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <section className="login-card">
            <div className="login-brand">
              <h1>Entrar</h1>
              <p>
                Faça login para acessar as funcionalidades protegidas do sistema.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={form.senha}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              {errorMessage ? (
                <div className="error-box" role="alert">
                  {errorMessage}
                </div>
              ) : null}

              <button className="login-button" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}