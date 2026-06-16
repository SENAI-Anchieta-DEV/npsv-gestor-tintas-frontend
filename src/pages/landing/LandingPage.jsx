import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Link,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
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
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useNavigate } from "react-router-dom";

const fotoVictor = new URL("../../assets/victor.jpeg", import.meta.url).href;
const fotoSamuel = new URL("../../assets/samuel.jpeg", import.meta.url).href;
const fotoNicolas = new URL("../../assets/nicolas.png", import.meta.url).href;
const fotoPedro = new URL("../../assets/pedro.jpg", import.meta.url).href;

const pitchVideo = new URL("../../assets/pitch-gestor-tintas.mp4", import.meta.url).href;
const qrCodeApp = new URL("../../assets/qrcode-app.png", import.meta.url).href;
const logoGestorTintas = new URL("../../assets/logo.png", import.meta.url).href;

const colors = {
  bg: "#F7F9FF",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F6FF",
  dark: "#101828",
  primary: "#4F46E5",
  primarySoft: "#EEF2FF",
  secondary: "#2B82FF",
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

const navItems = [
  { label: "Pitch", href: "#pitch" },
  { label: "Problema", href: "#problema" },
  { label: "Solução", href: "#solucao" },
  { label: "Impacto", href: "#impacto" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "Equipe", href: "#equipe" },
  { label: "App", href: "#app" },
];

const problems = [
  {
    icon: <WarningAmberOutlinedIcon />,
    title: "Estoque impreciso",
    description:
      "Sem integração, o sistema deixa de refletir a realidade da loja.",
  },
  {
    icon: <SyncAltOutlinedIcon />,
    title: "Processos desconectados",
    description:
      "Vendas, produção, pedidos e reposição ficam separados e geram retrabalho.",
  },
  {
    icon: <QueryStatsOutlinedIcon />,
    title: "Decisão sem visibilidade",
    description:
      "Dados espalhados reduzem agilidade e dificultam o controle da operação.",
  },
];

const modules = [
  {
    icon: <Inventory2OutlinedIcon />,
    title: "Estoque",
    description: "Baixa automática, alertas e rastreabilidade de insumos.",
  },
  {
    icon: <ShoppingCartOutlinedIcon />,
    title: "Vendas",
    description: "Registro de vendas, histórico e apoio ao atendimento.",
  },
  {
    icon: <PrecisionManufacturingOutlinedIcon />,
    title: "Produção",
    description: "Controle de fórmulas e uso de insumos com mais precisão.",
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: "Clientes",
    description: "Cadastro e relacionamento integrado ao fluxo comercial.",
  },
  {
    icon: <LocalShippingOutlinedIcon />,
    title: "Fornecedores",
    description: "Gestão de parceiros e apoio à reposição da loja.",
  },
  {
    icon: <ReceiptLongOutlinedIcon />,
    title: "Pedidos",
    description: "Acompanhamento de compras com atualização do estoque.",
  },
];

const impacts = [
  {
    icon: <TrendingUpOutlinedIcon />,
    title: "Mais eficiência",
    description: "Menos tarefas repetidas e mais fluidez no dia a dia.",
  },
  {
    icon: <WarningAmberOutlinedIcon />,
    title: "Menos desperdício",
    description: "Mais controle sobre fórmulas, insumos e movimentações.",
  },
  {
    icon: <QueryStatsOutlinedIcon />,
    title: "Mais clareza",
    description: "Informações centralizadas para apoiar a decisão.",
  },
  {
    icon: <SyncAltOutlinedIcon />,
    title: "Mais integração",
    description: "Toda a operação conectada em uma mesma plataforma.",
  },
];

const techs = [
  { icon: <StorageOutlinedIcon />, title: "Spring Boot 3", subtitle: "API REST" },
  { icon: <HubOutlinedIcon />, title: "React", subtitle: "Frontend Web" },
  { icon: <PhoneAndroidOutlinedIcon />, title: "Kotlin", subtitle: "App Android" },
  { icon: <SecurityOutlinedIcon />, title: "JWT", subtitle: "Autenticação" },
  { icon: <StorageOutlinedIcon />, title: "MySQL", subtitle: "Banco de dados" },
  { icon: <HubOutlinedIcon />, title: "MQTT", subtitle: "Integração IoT" },
];

const team = [
  {
    name: "Victor Mordachini",
    role: "Scrum Master · Product Owner · IoT",
    photo: fotoVictor,
    linkedin: "https://www.linkedin.com/in/victor-mordachini",
  },
  {
    name: "Samuel Correia",
    role: "Backend",
    photo: fotoSamuel,
    linkedin: "https://www.linkedin.com/in/samuel-c-moreira",
  },
  {
    name: "Nicolas Moura",
    role: "Frontend Web",
    photo: fotoNicolas,
    linkedin: "https://www.linkedin.com/in/nicolas-luis-moura-de-almeida",
  },
  {
    name: "Pedro Pina",
    role: "Mobile",
    photo: fotoPedro,
    linkedin: "https://www.linkedin.com/in/pedro-henricky-santos-pina-da-silva-002753399",
  },
];

function StandardCard({ children, center = false }) {
  return (
    <Card
      sx={{
        height: "100%",
        p: { xs: 2.5, md: 3 },
        borderRadius: "22px",
        border: `1px solid ${colors.border}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        backgroundColor: colors.surface,
        textAlign: center ? "center" : "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </Card>
  );
}

function SectionTitle({ eyebrow, title, description, light = false }) {
  return (
    <Box sx={{ mb: { xs: 4, md: 5 }, textAlign: "center" }}>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1.2}
        sx={{ mb: 1 }}
      >
        <Typography
          sx={{
            color: light ? colors.accentYellow : colors.primary,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Typography>

        <Box
          sx={{
            width: 34,
            height: 2,
            backgroundColor: light ? colors.accentYellow : colors.primary,
          }}
        />
      </Stack>

      <Typography
        sx={{
          fontSize: { xs: 30, md: 54 },
          lineHeight: 1.08,
          fontWeight: 900,
          color: light ? "#FFF" : colors.text,
          maxWidth: 860,
          mx: "auto",
          mb: 1.2,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          maxWidth: 760,
          mx: "auto",
          color: light ? "rgba(255,255,255,0.75)" : colors.textSoft,
          fontSize: { xs: 15, md: 17 },
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

function SmallMetric({ value, label }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 120,
        borderRadius: "18px",
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        p: 2.5,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          color: colors.primary,
          fontWeight: 900,
          fontSize: { xs: 28, md: 34 },
          lineHeight: 1,
          mb: 0.75,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ color: colors.textSoft, fontSize: 13, lineHeight: 1.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

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
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ flexGrow: 1 }}>
              <Box
                component="img"
                src={logoGestorTintas}
                alt="Logo Gestor Tintas"
                sx={{
                  width: 24,
                  height: 24,
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <Typography sx={{ fontWeight: 900, fontSize: 24, color: colors.text }}>
                Gestor <Box component="span" sx={{ color: colors.primary }}>Tintas</Box>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3.5} sx={{ display: { xs: "none", md: "flex" } }}>
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

      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
                <Box
                  sx={{
                    px: 1.6,
                    py: 1,
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "#DCFCE7 !important",
                    border: "1px solid #86EFAC !important",
                  }}
                >
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: "#16A34A !important" }} />
                  <Box
                    component="span"
                    sx={{
                      color: "#166534 !important",
                      fontSize: "13.5px !important",
                      fontWeight: "800 !important",
                      lineHeight: 1,
                    }}
                  >
                    Operação centralizada
                  </Box>
                </Box>

                <Box
                  sx={{
                    px: 1.6,
                    py: 1,
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "#DBEAFE !important",
                    border: "1px solid #93C5FD !important",
                  }}
                >
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: "#2563EB !important" }} />
                  <Box
                    component="span"
                    sx={{
                      color: "#1D4ED8 !important",
                      fontSize: "13.5px !important",
                      fontWeight: "800 !important",
                      lineHeight: 1,
                    }}
                  >
                    Mais rastreabilidade
                  </Box>
                </Box>

                <Box
                  sx={{
                    px: 1.6,
                    py: 1,
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "#FEF3C7 !important",
                    border: "1px solid #FCD34D !important",
                  }}
                >
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: "#D97706 !important" }} />
                  <Box
                    component="span"
                    sx={{
                      color: "#B45309 !important",
                      fontSize: "13.5px !important",
                      fontWeight: "800 !important",
                      lineHeight: 1,
                    }}
                  >
                    Menos desperdício
                  </Box>
                </Box>
              </Stack>

              <Typography
                sx={{
                  fontSize: { xs: 42, md: 72 },
                  lineHeight: 1.06,
                  fontWeight: 900,
                  maxWidth: 800,
                  background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Mais controle para a operação de lojas de tintas.
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 17, md: 21 },
                  color: colors.textSoft,
                  lineHeight: 1.75,
                  maxWidth: 650,
                }}
              >
                O Gestor Tintas integra estoque, vendas, produção, clientes, fornecedores e pedidos
                para reduzir desperdícios, eliminar retrabalho e dar mais visibilidade à gestão.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.2}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 3.5,
                    py: 1.7,
                    borderRadius: "14px",
                    backgroundColor: colors.primary,
                    color: "#FFF",
                    fontWeight: 800,
                    boxShadow: "0 12px 28px rgba(79,70,229,0.28)",
                    "&:hover": {
                      backgroundColor: colors.secondary,
                    },
                  }}
                >
                  Ver demonstração
                </Button>

                <Button
                  variant="outlined"
                  href="#solucao"
                  sx={{
                    px: 3.5,
                    py: 1.7,
                    borderRadius: "14px",
                    borderColor: colors.border,
                    color: colors.text,
                    fontWeight: 800,
                    "&:hover": {
                      borderColor: colors.primary,
                      color: colors.primary,
                      backgroundColor: colors.primarySoft,
                    },
                  }}
                >
                  Entender a solução
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", display: "grid", placeItems: "center", minHeight: 520 }}>
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 440,
                  borderRadius: "28px",
                  p: 3,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 24px 70px rgba(15,23,42,0.12)",
                  background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceAlt} 100%)`,
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ color: colors.text, fontWeight: 900, fontSize: 22 }}>
                        Painel operacional
                      </Typography>
                      <Typography sx={{ color: colors.textSoft, fontSize: 13 }}>
                        Visão resumida da loja em um só lugar
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: "18px",
                        backgroundColor: colors.primary,
                        display: "grid",
                        placeItems: "center",
                        color: "#FFF",
                        fontWeight: 900,
                      }}
                    >
                      GT
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <SmallMetric value="1.245" label="itens monitorados" />
                    </Grid>
                    <Grid item xs={6}>
                      <SmallMetric value="36" label="pedidos em fluxo" />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      borderRadius: "22px",
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      p: 2.5,
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ color: colors.text, fontWeight: 800 }}>
                          Resumo rápido
                        </Typography>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: colors.success,
                          }}
                        />
                      </Stack>

                      <Grid container spacing={1.5}>
                        {[
                          { label: "Estoque", value: "Atualizado", icon: "📦" },
                          { label: "Pedidos", value: "Rastreáveis", icon: "📋" },
                          { label: "Produção", value: "Controlada", icon: "🧪" },
                        ].map((item) => (
                          <Grid item xs={4} key={item.label}>
                            <Box
                              sx={{
                                p: 1.8,
                                borderRadius: "16px",
                                backgroundColor: colors.surfaceAlt,
                                textAlign: "center",
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              <Typography sx={{ fontSize: 20, mb: 0.5 }}>{item.icon}</Typography>
                              <Typography sx={{ fontSize: 11, color: colors.textSoft }}>
                                {item.label}
                              </Typography>
                              <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: colors.text }}>
                                {item.value}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box id="pitch" sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              maxWidth: 1100,
              mx: "auto",
              p: { xs: 2, md: 3 },
              borderRadius: "28px",
              background: "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(43,130,255,0.08))",
              border: `1px solid ${colors.border}`,
              boxShadow: "0 14px 34px rgba(0,0,0,0.06)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: colors.primary,
                  mb: 1,
                }}
              >
                Pitch do projeto
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 24, md: 34 },
                  fontWeight: 900,
                  color: colors.text,
                  lineHeight: 1.2,
                  mb: 1.2,
                }}
              >
                Conheça o Gestor Tintas em poucos minutos
              </Typography>

              <Typography
                sx={{
                  maxWidth: 760,
                  mx: "auto",
                  color: colors.textSoft,
                  fontSize: { xs: 15, md: 17 },
                  lineHeight: 1.75,
                }}
              >
                Um sistema pensado para integrar estoque, vendas, fórmulas, produção,
                clientes, fornecedores e pedidos em uma única plataforma.
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: "24px",
                overflow: "hidden",
                backgroundColor: "#000",
                boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
              }}
            >
              <video
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  display: "block",
                }}
              >
                <source src={pitchVideo} type="video/mp4" />
                Seu navegador não suporta vídeo.
              </video>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="problema" sx={{ py: { xs: 7, md: 9 }, backgroundColor: colors.surfaceAlt }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="O problema"
            title="Operações desorganizadas geram perda sem aviso."
            description="Quando estoque, vendas, produção e reposição não conversam entre si, a loja perde controle, agilidade e margem."
          />

          <Box
            sx={{
              maxWidth: 1240,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {problems.map((item) => (
              <StandardCard key={item.title}>
                <Box sx={{ color: colors.accentOrange, mb: 2, fontSize: 30 }}>
                  {item.icon}
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: colors.text,
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography sx={{ color: colors.textSoft, lineHeight: 1.65, fontSize: 15 }}>
                  {item.description}
                </Typography>
              </StandardCard>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 7, md: 9 }, backgroundColor: colors.surface }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Por que este projeto existe"
            title="Uma resposta prática para um setor que ainda sofre com controles frágeis."
            description="O Gestor Tintas foi pensado para reduzir falhas operacionais, dar mais previsibilidade à loja e transformar rotinas dispersas em uma operação integrada."
          />

          <Box
            sx={{
              maxWidth: 1240,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {[
              {
                title: "Intenção do projeto",
                text: "Estruturar uma operação mais confiável, com menos dependência de controles paralelos e mais apoio à gestão.",
              },
              {
                title: "Problema central",
                text: "Quando os fluxos não se comunicam, a empresa perde tempo, precisão e capacidade de resposta ao cliente.",
              },
              {
                title: "O que a solução busca entregar",
                text: "Mais controle, mais rastreabilidade e mais segurança para decidir e crescer.",
              },
            ].map((item) => (
              <StandardCard key={item.title}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: colors.text,
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography sx={{ color: colors.textSoft, lineHeight: 1.65, fontSize: 15 }}>
                  {item.text}
                </Typography>
              </StandardCard>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="solucao" sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="A solução"
            title="Uma plataforma centralizada para gerir a loja inteira."
            description="O sistema conecta os principais fluxos do negócio para reduzir erros, melhorar a visibilidade e acelerar a operação."
          />

          <Box
            sx={{
              maxWidth: 980,
              mx: "auto",
              mb: 5,
              p: { xs: 2.5, md: 3 },
              borderRadius: "22px",
              backgroundColor: colors.primarySoft,
              border: `1px solid ${colors.border}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontWeight: 900, color: colors.text, fontSize: 22, mb: 1.2 }}>
              Não é apenas um sistema de cadastro.
            </Typography>

            <Typography sx={{ color: colors.textSoft, lineHeight: 1.75, fontSize: 16 }}>
              O Gestor Tintas foi pensado como uma plataforma de integração operacional,
              conectando dados e processos para apoiar a rotina da loja do balcão à produção.
            </Typography>
          </Box>

          <Box
            sx={{
              maxWidth: 1240,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {modules.map((module) => (
              <StandardCard key={module.title}>
                <Box sx={{ color: colors.primary, mb: 2, fontSize: 32 }}>
                  {module.icon}
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: colors.text,
                    mb: 1,
                  }}
                >
                  {module.title}
                </Typography>

                <Typography sx={{ color: colors.textSoft, lineHeight: 1.65, fontSize: 15 }}>
                  {module.description}
                </Typography>
              </StandardCard>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="impacto" sx={{ py: { xs: 7, md: 9 }, backgroundColor: colors.surfaceAlt }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Impacto esperado"
            title="Mais controle, menos perda e uma operação mais madura."
            description="A proposta do Gestor Tintas é gerar impacto direto no funcionamento da loja, reduzindo falhas operacionais e aumentando a confiabilidade das informações."
          />

          <Box sx={{ maxWidth: 1280, mx: "auto" }}>
            <Grid container spacing={3}>
              {impacts.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.title}>
                  <StandardCard center>
                    <Box sx={{ color: colors.primary, mb: 1.5, fontSize: 30 }}>
                      {item.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: colors.text,
                        fontSize: 18,
                        mb: 1,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: colors.textSoft,
                        lineHeight: 1.65,
                        fontSize: 14.5,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </StandardCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box id="tecnologia" sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Tecnologia"
            title="Base técnica moderna e preparada para integração."
            description="Uma arquitetura pensada para clareza, segurança e evolução da solução."
          />

          <Box sx={{ maxWidth: 1180, mx: "auto" }}>
            <Grid container spacing={3} justifyContent="center">
              {techs.map((tech) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={tech.title}>
                  <StandardCard center>
                    <Box sx={{ color: colors.primary, mb: 1.6, fontSize: 34 }}>
                      {tech.icon}
                    </Box>

                    <Typography sx={{ fontWeight: 900, color: colors.text, mb: 0.5, fontSize: 18 }}>
                      {tech.title}
                    </Typography>

                    <Typography sx={{ color: colors.textSoft, fontSize: 14, lineHeight: 1.6 }}>
                      {tech.subtitle}
                    </Typography>
                  </StandardCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box id="equipe" sx={{ py: { xs: 7, md: 9 }, backgroundColor: colors.surfaceAlt }}>
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Equipe"
            title="Uma equipe multidisciplinar construindo a solução."
            description="Backend, frontend, mobile e IoT conectados para estruturar uma plataforma consistente."
          />

          <Box sx={{ maxWidth: 1080, mx: "auto" }}>
            <Grid container spacing={3} justifyContent="center">
              {team.map((member) => (
                <Grid item xs={12} sm={6} md={3} key={member.name}>
                  <StandardCard center>
                    <Box
                      sx={{
                        width: 82,
                        height: 82,
                        borderRadius: "999px",
                        overflow: "hidden",
                        mx: "auto",
                        mb: 2,
                        border: "3px solid #FFFFFF",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                        backgroundColor: "#E5E7EB",
                      }}
                    >
                      <img
                        src={member.photo}
                        alt={member.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.8,
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, color: colors.text, fontSize: 18 }}>
                        {member.name}
                      </Typography>

                      {member.linkedin ? (
                        <Box
                          component="a"
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0A66C2",
                            transition: "transform 0.18s ease, opacity 0.18s ease",
                            "&:hover": {
                              transform: "scale(1.08)",
                              opacity: 0.9,
                            },
                          }}
                        >
                          <LinkedInIcon sx={{ fontSize: 20 }} />
                        </Box>
                      ) : null}
                    </Box>

                    <Typography sx={{ color: colors.textSoft, fontSize: 14, mt: 0.8 }}>
                      {member.role}
                    </Typography>
                  </StandardCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box id="app" sx={{ py: { xs: 8, md: 11 }, backgroundColor: colors.dark }}>
        <Container maxWidth="lg">
          <SectionTitle
            eyebrow="App mobile"
            title="Baixe o app do Gestor Tintas"
            description="Aplicação Android para consulta rápida e apoio à operação no dia a dia."
            light
          />

          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: { xs: 220, md: 260 },
                height: { xs: 220, md: 260 },
                backgroundColor: "#FFFFFF",
                mx: "auto",
                mb: 3,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
                borderRadius: "22px",
                border: "3px solid rgba(255,255,255,0.12)",
                outline: "1px solid rgba(79,70,229,0.35)",
              }}
            >
              <img
                src={qrCodeApp}
                alt="QR Code para baixar o app Gestor Tintas"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                }}
              />
            </Box>

            <Typography
              sx={{
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: { xs: 22, md: 26 },
                mb: 1,
              }}
            >
              Baixe o app agora
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.78)",
                fontSize: { xs: 15, md: 17 },
                mb: 2.5,
              }}
            >
              Aponte a câmera do celular para instalar o APK do Gestor Tintas.
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2.2,
                py: 1.2,
                borderRadius: "999px",
                background: "linear-gradient(135deg, rgba(79,70,229,0.22), rgba(43,130,255,0.18))",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              📱 Escaneie o QR Code
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          background: "linear-gradient(135deg, #2E33FF 0%, #2B82FF 100%)",
          py: { xs: 6, md: 9 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: 30, md: 58 },
              lineHeight: 1.08,
              fontWeight: 900,
              color: "#FFF",
              maxWidth: 920,
              mx: "auto",
            }}
          >
            “Do balcão à lata, precisão exata.”
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              mt: 2.5,
              color: "rgba(255,255,255,0.88)",
              fontWeight: 700,
            }}
          >
            Gestor Tintas · Projeto aplicado SENAI Anchieta · 2025–2026
          </Typography>
        </Container>
      </Box>

      <Box
        sx={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #312E81 100%)",
          py: { xs: 6, md: 8 },
          borderTop: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={5} alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <Stack spacing={2.2}>
                <Stack direction="row" alignItems="center" spacing={1.4}>
                  <Box
                    component="img"
                    src={logoGestorTintas}
                    alt="Logo Gestor Tintas"
                    sx={{
                      width: 38,
                      height: 38,
                      objectFit: "contain",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      p: 0.7,
                    }}
                  />

                  <Typography sx={{ color: "#FFFFFF", fontWeight: 900, fontSize: 22 }}>
                    Gestor{" "}
                    <Box component="span" sx={{ color: "#A5B4FC" }}>
                      Tintas
                    </Box>
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    maxWidth: 360,
                  }}
                >
                  Plataforma para gestão operacional integrada em lojas de tintas,
                  conectando estoque, vendas, produção, clientes, fornecedores e pedidos.
                </Typography>

                <Box
                  sx={{
                    display: "inline-flex",
                    width: "fit-content",
                    px: 1.6,
                    py: 0.9,
                    borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#E0E7FF",
                    fontSize: 12.5,
                    fontWeight: 800,
                  }}
                >
                  Projeto aplicado SENAI Anchieta · 2025–2026
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2.2}>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Integrantes
                </Typography>

                <Stack spacing={1.2}>
                  {team.map((member) => (
                    <Box
                      key={member.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        color: "rgba(255,255,255,0.76)",
                        fontSize: 14,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#A5B4FC",
                          flexShrink: 0,
                        }}
                      />

                      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>
                        {member.name} — {member.role}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2.2}>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Direitos reservados
                </Typography>

                <Box
                  sx={{
                    p: 2.4,
                    borderRadius: "20px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#FFFFFF",
                      fontSize: 13.5,
                      lineHeight: 1.75,
                      fontWeight: 600,
                    }}
                  >
                    © 2026 Equipe NPSV. Todos os direitos relacionados ao projeto
                    Gestor Tintas são exclusivamente reservados aos integrantes do grupo:
                    Victor Mordachini, Samuel Correia, Nicolas Moura e Pedro Pina.
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.68)",
                      fontSize: 12.5,
                      lineHeight: 1.7,
                      mt: 1.4,
                    }}
                  >
                    É proibida a cópia, reprodução, distribuição, apresentação ou uso da
                    ideia, identidade visual, código, funcionalidades, slogan, materiais
                    e conceito do projeto sem autorização expressa da equipe.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.56)",
                fontSize: 12.5,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Gestor Tintas · Do balcão à lata, precisão exata.
            </Typography>

            <Stack direction="row" spacing={1.4}>
              {team.map((member) =>
                member.linkedin ? (
                  <Box
                    key={member.name}
                    component="a"
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={member.name}
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "rgba(255,255,255,0.10)",
                      color: "#FFFFFF",
                      border: "1px solid rgba(255,255,255,0.12)",
                      transition: "0.18s ease",
                      "&:hover": {
                        backgroundColor: "#0A66C2",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <LinkedInIcon sx={{ fontSize: 20 }} />
                  </Box>
                ) : null
              )}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}