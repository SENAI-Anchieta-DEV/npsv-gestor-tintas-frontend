import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import qrCodeApp from "../../assets/qrcode-app.png";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PhoneAndroidOutlinedIcon from "@mui/icons-material/PhoneAndroidOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import { useNavigate } from "react-router-dom";

const colors = {
  bg: "#FAFBFF",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFF",
  dark: "#1A1F36",
  darkSoft: "#2D3748",
  primary: "#4F46E5",
  primarySoft: "#EEF2FF",
  secondary: "#6366F1",
  accentYellow: "#F59E0B",
  accentOrange: "#F97316",
  text: "#1F2937",
  textSoft: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  danger: "#EF4444",
};

const problems = [
  {
    title: "Estoque fantasma",
    description:
      "Sem atualização automática, o sistema deixa de refletir a realidade da loja e prejudica compras, produção e vendas.",
  },
  {
    title: "Retrabalho e desperdício",
    description:
      "Fórmulas, baixa de insumos e reposição sem integração geram erros operacionais e perda financeira.",
  },
  {
    title: "Processos desconectados",
    description:
      "Clientes, fornecedores, vendas e estoque em fluxos separados dificultam controle e tomada de decisão.",
  },
];

const modules = [
  {
    icon: <Inventory2OutlinedIcon />,
    title: "Controle de Estoque",
    description:
      "Baixa automática de insumos, rastreabilidade e alertas de estoque mínimo em uma visão centralizada.",
  },
  {
    icon: <ShoppingCartOutlinedIcon />,
    title: "Gestão de Vendas",
    description:
      "Registro de vendas com cliente, validação de disponibilidade e histórico por vendedor e período.",
  },
  {
    icon: <ReceiptLongOutlinedIcon />,
    title: "Pedidos a Fornecedores",
    description:
      "Criação, acompanhamento e recebimento de pedidos com atualização automática do estoque.",
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: "Gestão de Clientes",
    description:
      "Cadastro, edição e associação de clientes às vendas para manter histórico e relacionamento.",
  },
  {
    icon: <LocalShippingOutlinedIcon />,
    title: "Gestão de Fornecedores",
    description:
      "Cadastro e acompanhamento de parceiros comerciais integrados ao fluxo de reposição.",
  },
  {
    icon: <PhoneAndroidOutlinedIcon />,
    title: "App Mobile",
    description:
      "Consulta de estoque, preços e informações operacionais no celular, com foco em praticidade.",
  },
];

const techs = [
  { icon: <StorageOutlinedIcon />, title: "Spring Boot 3", subtitle: "Backend API REST" },
  { icon: <HubOutlinedIcon />, title: "React.js", subtitle: "Frontend Web" },
  { icon: <PhoneAndroidOutlinedIcon />, title: "Kotlin + Compose", subtitle: "App Android" },
  { icon: <SecurityOutlinedIcon />, title: "JWT + Security", subtitle: "Autenticação" },
  { icon: <StorageOutlinedIcon />, title: "MySQL", subtitle: "Banco de Dados" },
  { icon: <HubOutlinedIcon />, title: "MQTT", subtitle: "Mensageria IoT" },
];

const sprints = [
  {
    sprint: "Sprint 01",
    period: "Dez/25 — Jan/26",
    focus: "Planejamento, domínio e base da API",
    deliveries: "~15 SP",
    status: "Concluída",
  },
  {
    sprint: "Sprint 02",
    period: "Jan — Fev/26",
    focus: "Autenticação, estrutura backend e UI base",
    deliveries: "~21 SP",
    status: "Concluída",
  },
  {
    sprint: "Sprint 03",
    period: "Mar/26",
    focus: "JWT integrado, frontend web e mobile base",
    deliveries: "56 SP",
    status: "Concluída",
  },
  {
    sprint: "Sprint 04",
    period: "Mar — Abr/26",
    focus: "Produção, fórmulas, estoque e exceções",
    deliveries: "41 SP",
    status: "Concluída",
  },
  {
    sprint: "Sprint 05",
    period: "Abr — Mai/26",
    focus: "MQTT, clientes, fornecedores e pedidos",
    deliveries: "108 SP planejados",
    status: "Em andamento",
  },
];

const team = [
  {
    initials: "VM",
    name: "Victor Mordachini",
    role: "Scrum Master · Product Owner · IoT",
    color: "#FFA113",
    tags: ["ESP32", "MQTT", "PlatformIO", "Ágil"],
  },
  {
    initials: "SC",
    name: "Samuel Correia",
    role: "Desenvolvedor Backend",
    color: "#032055",
    tags: ["Spring Boot", "JWT", "MySQL", "REST"],
  },
  {
    initials: "NM",
    name: "Nicolas Moura",
    role: "Desenvolvedor Frontend Web",
    color: "#2E33FF",
    tags: ["React", "UI", "UX", "Axios"],
  },
  {
    initials: "PP",
    name: "Pedro Pina",
    role: "Desenvolvedor Mobile",
    color: "#2B82FF",
    tags: ["Kotlin", "Compose", "Retrofit", "Android"],
  },
];

function SectionTitle({ eyebrow, title, description, light = false }) {
  return (
    <Box sx={{ mb: 5, textAlign: "center" }}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Typography
          sx={{
            color: light ? colors.accentYellow : colors.primary,
            fontSize: 12,
            letterSpacing: "0.18em",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Typography>

        <Box
          sx={{
            width: 36,
            height: 2,
            backgroundColor: light ? colors.accentYellow : colors.primary,
          }}
        />
      </Stack>

      <Typography
        sx={{
          fontSize: { xs: 34, md: 58 },
          lineHeight: 1.06,
          fontWeight: 800,
          color: light ? "#FFFFFF" : colors.text,
          maxWidth: 760,
          mb: 2,
          mx: "auto",
        }}
      >
        {title}
      </Typography>

      {description ? (
        <Typography
          sx={{
            maxWidth: 760,
            color: light ? "rgba(255,255,255,0.72)" : colors.textSoft,
            fontSize: { xs: 16, md: 18 },
            lineHeight: 1.8,
            mx: "auto",
          }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

function StatusChip({ label, type }) {
  const map = {
    success: {
      bg: "rgba(34,197,94,0.12)",
      color: colors.success,
    },
    warning: {
      bg: "rgba(255,161,19,0.14)",
      color: colors.warning,
    },
    info: {
      bg: "rgba(43,130,255,0.14)",
      color: colors.info,
    },
  };

  return (
    <Chip
      label={label}
      sx={{
        fontWeight: 700,
        backgroundColor: map[type].bg,
        color: map[type].color,
      }}
    />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const navItems = [
    { label: "O problema", href: "#problema" },
    { label: "Solução", href: "#solucao" },
    { label: "Progresso", href: "#progresso" },
    { label: "Equipe", href: "#equipe" },
    { label: "App", href: "#app" },
  ];

  return (
    <Box sx={{ backgroundColor: colors.bg }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "rgba(247, 249, 255, 0.94)",
          color: colors.text,
          borderBottom: `1px solid ${colors.border}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          <Container maxWidth="xl" sx={{ display: "flex", alignItems: "center" }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: 20 }}>🎨</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 25, color: colors.text }}>
                Gestor{" "}
                <Box component="span" sx={{ color: colors.primary }}>
                  Tintas
                </Box>
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={4}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  underline="none"
                  sx={{
                    color: colors.textSoft,
                    fontSize: 14,
                    fontWeight: 700,
                    "&:hover": { color: colors.primary },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 10, md: 16 } }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    backgroundColor: colors.primary,
                    display: "grid",
                    placeItems: "center",
                    color: "#FFF",
                    fontSize: 20,
                  }}
                >
                  🎨
                </Box>
                <Typography
                  sx={{
                    color: colors.primary,
                    fontSize: 14,
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: colors.primarySoft,
                    px: 2,
                    py: 1,
                    borderRadius: "20px",
                  }}
                >
                  TCC SENAI — Desenvolvimento de Sistemas
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: { xs: 48, md: 80 },
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: colors.text,
                  maxWidth: 800,
                  background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gestão{" "}
                <Box component="span" sx={{ fontStyle: "italic" }}>
                  inteligente
                </Box>{" "}
                para lojas de tintas.
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 18, md: 24 },
                  color: colors.textSoft,
                  lineHeight: 1.6,
                  maxWidth: 600,
                }}
              >
                O Gestor Tintas centraliza estoque, vendas, clientes, fornecedores
                e pedidos em uma única plataforma, conectando operação, rastreabilidade
                e tomada de decisão.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    backgroundColor: colors.primary,
                    color: "#FFF",
                    px: 4,
                    py: 2,
                    borderRadius: "16px",
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: `0 10px 30px rgba(79, 70, 229, 0.3)`,
                    "&:hover": {
                      backgroundColor: colors.secondary,
                      transform: "translateY(-2px)",
                      boxShadow: `0 15px 40px rgba(79, 70, 229, 0.4)`,
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Ver o sistema →
                </Button>

                <Button
                  variant="outlined"
                  href="#app"
                  sx={{
                    borderColor: colors.border,
                    color: colors.text,
                    px: 4,
                    py: 2,
                    borderRadius: "16px",
                    fontWeight: 700,
                    fontSize: 16,
                    "&:hover": {
                      borderColor: colors.primary,
                      color: colors.primary,
                      backgroundColor: colors.primarySoft,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Baixar app
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                minHeight: 600,
                display: "grid",
                placeItems: "center",
                position: "relative",
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 420,
                  borderRadius: "32px",
                  boxShadow: "0 32px 80px rgba(15,23,42,0.15)",
                  p: 4,
                  background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceAlt} 100%)`,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Stack spacing={4}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: colors.text, fontSize: 24 }}>
                        Gestor Tintas
                      </Typography>
                      <Typography sx={{ color: colors.textSoft, fontSize: 14, mt: 0.5 }}>
                        Interface limpa para controlar estoque, vendas e pedidos.
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "20px",
                        backgroundColor: colors.primary,
                        display: "grid",
                        placeItems: "center",
                        color: "#FFF",
                        fontWeight: 800,
                        fontSize: 18,
                        boxShadow: `0 8px 24px rgba(79, 70, 229, 0.3)`,
                      }}
                    >
                      UI
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      borderRadius: "28px",
                      backgroundColor: colors.surface,
                      p: 4,
                      border: `1px solid ${colors.border}`,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Stack spacing={3}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography sx={{ color: colors.textSoft, fontSize: 13 }}>Saldo de estoque</Typography>
                          <Typography sx={{ color: colors.text, fontWeight: 900, fontSize: 32 }}>1.245</Typography>
                        </Box>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.success, boxShadow: `0 0 0 3px rgba(16, 185, 129, 0.2)` }} />
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1, borderRadius: "24px", backgroundColor: colors.surfaceAlt, p: 3, border: `1px solid ${colors.border}` }}>
                          <Typography sx={{ color: colors.textSoft, fontSize: 13 }}>Pedidos</Typography>
                          <Typography sx={{ color: colors.text, fontWeight: 700, fontSize: 20 }}>36</Typography>
                        </Box>
                        <Box sx={{ flex: 1, borderRadius: "24px", backgroundColor: colors.surfaceAlt, p: 3, border: `1px solid ${colors.border}` }}>
                          <Typography sx={{ color: colors.textSoft, fontSize: 13 }}>Vendas</Typography>
                          <Typography sx={{ color: colors.text, fontWeight: 700, fontSize: 20 }}>R$ 8,2k</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                  <Stack spacing={2}>
                    <Typography sx={{ fontWeight: 700, color: colors.text, fontSize: 16 }}>Resumo rápido</Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {[
                        { label: "Estoque", value: "Atual", icon: "📦" },
                        { label: "Pedidos", value: "Pendentes", icon: "📋" },
                        { label: "Clientes", value: "Ativos", icon: "👥" },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            flex: 1,
                            minWidth: 120,
                            borderRadius: "20px",
                            backgroundColor: colors.surfaceAlt,
                            p: 3,
                            border: `1px solid ${colors.border}`,
                            textAlign: "center",
                            transition: "transform 0.2s ease",
                            "&:hover": { transform: "translateY(-4px)" },
                          }}
                        >
                          <Typography sx={{ fontSize: 24, mb: 1 }}>{item.icon}</Typography>
                          <Typography sx={{ color: colors.textSoft, fontSize: 12 }}>{item.label}</Typography>
                          <Typography sx={{ color: colors.text, fontWeight: 700 }}>{item.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Stack>
              </Card>

              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: colors.accentYellow,
                  opacity: 0.1,
                  zIndex: -1,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  backgroundColor: colors.primary,
                  opacity: 0.05,
                  zIndex: -1,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box id="problema" sx={{ py: { xs: 10, md: 16 }, backgroundColor: colors.surfaceAlt }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="O problema"
            title="Operações desorganizadas geram perda sem aviso."
            description="Quando estoque, vendas e reposição não conversam entre si, a loja perde controle, agilidade e dinheiro."
          />

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                {problems.map((item, index) => (
                  <Card
                    key={item.title}
                    sx={{
                      borderRadius: "24px",
                      borderLeft: `6px solid ${colors.primary}`,
                      backgroundColor: colors.surface,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                      p: 4,
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                  >
                    <Stack direction="row" spacing={3}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "20px",
                          backgroundColor: colors.primarySoft,
                          display: "grid",
                          placeItems: "center",
                          color: colors.primary,
                        }}
                      >
                        <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: colors.text, mb: 2, fontSize: 20 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ color: colors.textSoft, lineHeight: 1.7, fontSize: 16 }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Grid container spacing={3}>
                {[
                  { value: "4+", text: "módulos integrados no mesmo fluxo operacional", icon: "🔗" },
                  { value: "100%", text: "mais rastreabilidade das movimentações", icon: "📊" },
                  { value: "0", text: "papel no fluxo digital centralizado", icon: "📱" },
                  { value: "1", text: "plataforma conectando operação e gestão", icon: "🏢" },
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item.value}>
                    <Card
                      sx={{
                        minHeight: 180,
                        backgroundColor: colors.surface,
                        borderRadius: "24px",
                        border: `1px solid ${colors.border}`,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                        p: 3,
                        textAlign: "center",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "translateY(-4px)" },
                      }}
                    >
                      <Typography sx={{ fontSize: 32, mb: 2 }}>{item.icon}</Typography>
                      <Typography
                        sx={{
                          fontSize: 48,
                          fontWeight: 900,
                          color: colors.primary,
                          lineHeight: 1,
                          mb: 2,
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography sx={{ color: colors.textSoft, lineHeight: 1.6, fontSize: 14 }}>
                        {item.text}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="solucao" sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="A solução"
            title="Um sistema centralizado para gerir a loja inteira."
            description="O Gestor Tintas conecta os principais fluxos do negócio para reduzir erros, melhorar a visibilidade e acelerar a operação."
          />

          <Grid container spacing={4} alignItems="stretch">
            {modules.map((module) => (
              <Grid item xs={12} md={4} key={module.title}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "24px",
                    minHeight: 320,
                    backgroundColor: colors.surface,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    border: `1px solid ${colors.border}`,
                    p: 4,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 64px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box sx={{ color: colors.primary, mb: 3, fontSize: 40 }}>
                    {module.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: colors.text, mb: 2, fontSize: 20 }}>
                    {module.title}
                  </Typography>
                  <Typography sx={{ color: colors.textSoft, lineHeight: 1.7, fontSize: 16 }}>
                    {module.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 10, md: 16 }, backgroundColor: colors.surfaceAlt }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Tecnologia"
            title="Stack moderna, alinhada ao projeto."
            description="Uma base técnica pensada para integração, escalabilidade e clareza arquitetural."
          />

          <Grid container spacing={4} alignItems="stretch">
            {techs.map((tech) => (
              <Grid item xs={12} sm={6} md={4} key={tech.title}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "24px",
                    minHeight: 240,
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                    p: 4,
                    textAlign: "center",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <Box sx={{ color: colors.primary, mb: 3, fontSize: 48 }}>
                    {tech.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, mb: 1, color: colors.text, fontSize: 18 }}>
                    {tech.title}
                  </Typography>
                  <Typography sx={{ color: colors.textSoft, fontSize: 14 }}>
                    {tech.subtitle}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="progresso" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Progresso do projeto"
            title="Sprints entregues, sistema em consolidação."
            description="O projeto evoluiu em etapas, com entregas progressivas até a estruturação completa da plataforma."
          />

          <Stack spacing={2}>
            {sprints.map((item) => (
              <Card
                key={item.sprint}
                sx={{
                  borderRadius: "18px",
                  boxShadow: "none",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Typography sx={{ fontWeight: 800, color: colors.text }}>
                        {item.sprint}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography sx={{ color: colors.textSoft }}>{item.period}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ color: colors.text }}>{item.focus}</Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography sx={{ color: colors.textSoft }}>{item.deliveries}</Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      {item.status === "Concluída" ? (
                        <StatusChip label={item.status} type="success" />
                      ) : (
                        <StatusChip label={item.status} type="warning" />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>

      <Box id="equipe" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="A equipe"
            title="Quatro especialistas, um sistema."
            description="Cada integrante assumiu uma frente crítica para construir uma solução integrada e consistente."
          />

          <Grid container spacing={4}>
            {team.map((member) => (
              <Grid item xs={12} sm={6} md={3} key={member.name}>
                <Card
                  sx={{
                    borderRadius: "24px",
                    minHeight: 320,
                    backgroundColor: colors.surface,
                    boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                    border: `1px solid ${colors.border}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 84,
                        height: 84,
                        borderRadius: "999px",
                        backgroundColor: member.color,
                        color: "#FFF",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: 28,
                        mx: "auto",
                        mb: 3,
                      }}
                    >
                      {member.initials}
                    </Box>

                    <Typography sx={{ fontWeight: 800, color: colors.text }}>
                      {member.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: colors.textSoft,
                        fontSize: 14,
                        mt: 1,
                        mb: 2.5,
                        minHeight: 42,
                      }}
                    >
                      {member.role}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      justifyContent="center"
                    >
                      {member.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: colors.primarySoft,
                            color: colors.text,
                            fontWeight: 700,
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="app" sx={{ py: { xs: 8, md: 12 }, backgroundColor: colors.dark }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <SectionTitle
              eyebrow="App mobile"
              title="Baixe o app do Gestor Tintas"
              description="Android nativo em Kotlin com Jetpack Compose para consulta rápida e apoio à operação."
              light
            />

            <Box
              sx={{
                width: 180,
                height: 180,
                backgroundColor: "#FFFFFF",
                mx: "auto",
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src="./qrcode-app.a176cb5b.png"
                alt="QR Code para baixar o app Gestor Tintas"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Typography sx={{ color: "#FFF", fontWeight: 800, mb: 1 }}>
              📱 Gestor Tintas — Android
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              Aponte a câmera para baixar o APK
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          background: "linear-gradient(135deg, #2E33FF 0%, #2B82FF 100%)",
          py: { xs: 7, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: 34, md: 68 },
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#FFFFFF",
              maxWidth: 900,
              mx: "auto",
            }}
          >
            "Do balcão à lata, precisão exata."
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              mt: 3,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 700,
            }}
          >
            Gestor Tintas · TCC SENAI Anchieta · 2025–2026
          </Typography>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: colors.surface, py: 8, borderTop: `1px solid ${colors.border}` }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} justifyContent="space-between" alignItems="flex-start">
            <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Stack spacing={4} sx={{ maxWidth: 320 }}>
                <Typography sx={{ color: colors.text, fontWeight: 800, fontSize: 18 }}>
                  Gestor{" "}
                  <Box component="span" sx={{ color: colors.primary }}>
                    Tintas
                  </Box>
                </Typography>
                <Typography sx={{ color: colors.textSoft, fontSize: 14 }}>
                  Sistema de gestão inteligente de tintas.
                </Typography>
                <Typography sx={{ color: colors.textSoft, fontSize: 12 }}>
                  © 2026 Equipe NPSV — TCC SENAI Anchieta
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <Stack spacing={3} alignItems="center" sx={{ maxWidth: 320 }}>
                <Typography sx={{ color: colors.textSoft, fontSize: 14, fontWeight: 700 }}>
                  Equipe
                </Typography>
                <Typography sx={{ color: colors.textSoft, fontSize: 14, textAlign: "center" }}>
                  Victor Mordachini · Samuel Correia<br />
                  Nicolas Moura · Pedro Pina
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-end" } }}>
              <Stack spacing={4} alignItems={{ xs: "center", md: "flex-end" }} sx={{ maxWidth: 320 }}>
                <Typography sx={{ color: colors.textSoft, fontSize: 14, fontWeight: 700 }}>
                  Conecte-se
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: colors.primarySoft,
                      display: "grid",
                      placeItems: "center",
                      color: colors.primary,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: colors.primary, color: "#FFF" },
                    }}
                  >
                    📧
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: colors.primarySoft,
                      display: "grid",
                      placeItems: "center",
                      color: colors.primary,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: colors.primary, color: "#FFF" },
                    }}
                  >
                    📱
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: colors.primarySoft,
                      display: "grid",
                      placeItems: "center",
                      color: colors.primary,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: colors.primary, color: "#FFF" },
                    }}
                  >
                    🌐
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}