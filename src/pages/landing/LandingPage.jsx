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
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { useNavigate } from "react-router-dom";

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
  { label: "Problema", href: "#problema" },
  { label: "Solução", href: "#solucao" },
  { label: "Impacto", href: "#impacto" },
  { label: "Tecnologia", href: "#tecnologia" },
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
    initials: "VM",
    name: "Victor Mordachini",
    role: "Scrum Master · Product Owner · IoT",
    color: "#FFA113",
  },
  {
    initials: "SC",
    name: "Samuel Correia",
    role: "Backend",
    color: "#032055",
  },
  {
    initials: "NM",
    name: "Nicolas Moura",
    role: "Frontend Web",
    color: "#2E33FF",
  },
  {
    initials: "PP",
    name: "Pedro Pina",
    role: "Mobile",
    color: "#2B82FF",
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
              <Typography sx={{ fontSize: 20 }}>🎨</Typography>
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
              <Stack direction="row" spacing={1.5} alignItems="center">
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

                <Chip
                  label="Projeto aplicado de gestão operacional"
                  sx={{
                    backgroundColor: colors.primarySoft,
                    color: colors.primary,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                />
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

              <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
                <Chip
                  icon={<CheckCircleOutlineOutlinedIcon sx={{ color: `${colors.success} !important` }} />}
                  label="Operação centralizada"
                  sx={{ backgroundColor: "#ECFDF5", fontWeight: 700 }}
                />
                <Chip
                  icon={<CheckCircleOutlineOutlinedIcon sx={{ color: `${colors.info} !important` }} />}
                  label="Mais rastreabilidade"
                  sx={{ backgroundColor: "#EFF6FF", fontWeight: 700 }}
                />
                <Chip
                  icon={<CheckCircleOutlineOutlinedIcon sx={{ color: `${colors.warning} !important` }} />}
                  label="Menos desperdício"
                  sx={{ backgroundColor: "#FFFBEB", fontWeight: 700 }}
                />
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
                        width: 78,
                        height: 78,
                        borderRadius: "999px",
                        backgroundColor: member.color,
                        color: "#FFF",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 900,
                        fontSize: 26,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {member.initials}
                    </Box>

                    <Typography sx={{ fontWeight: 900, color: colors.text, fontSize: 18 }}>
                      {member.name}
                    </Typography>

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
                width: 180,
                height: 180,
                backgroundColor: "#FFF",
                mx: "auto",
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                overflow: "hidden",
                borderRadius: "14px",
              }}
            >
              <Box
                component="img"
                src={qrCodeApp}
                alt="QR Code para baixar o app Gestor Tintas"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Typography sx={{ color: "#FFF", fontWeight: 900, mb: 0.8 }}>
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
            “Da operação diária à decisão estratégica, mais controle para a loja inteira.”
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

      <Box sx={{ backgroundColor: colors.surface, py: 7, borderTop: `1px solid ${colors.border}` }}>
        <Container maxWidth="xl">
          <Grid container spacing={5} justifyContent="space-between" alignItems="flex-start">
            <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Stack spacing={2.5} sx={{ maxWidth: 320 }}>
                <Typography sx={{ color: colors.text, fontWeight: 900, fontSize: 18 }}>
                  Gestor <Box component="span" sx={{ color: colors.primary }}>Tintas</Box>
                </Typography>
                <Typography sx={{ color: colors.textSoft, fontSize: 14 }}>
                  Plataforma para gestão operacional integrada em lojas de tintas.
                </Typography>
                <Typography sx={{ color: colors.textSoft, fontSize: 12 }}>
                  © 2026 Equipe NPSV — Projeto aplicado SENAI Anchieta
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 320 }}>
                <Typography sx={{ color: colors.textSoft, fontSize: 14, fontWeight: 800 }}>
                  Equipe
                </Typography>
                <Typography sx={{ color: colors.textSoft, fontSize: 14, textAlign: "center" }}>
                  Victor Mordachini · Samuel Correia
                  <br />
                  Nicolas Moura · Pedro Pina
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-end" } }}>
              <Stack spacing={2.5} alignItems={{ xs: "center", md: "flex-end" }} sx={{ maxWidth: 320 }}>
                <Typography sx={{ color: colors.textSoft, fontSize: 14, fontWeight: 800 }}>
                  Conecte-se
                </Typography>
                <Stack direction="row" spacing={2.2}>
                  {["📧", "📱", "🌐"].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: colors.primarySoft,
                        display: "grid",
                        placeItems: "center",
                        color: colors.primary,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: colors.primary,
                          color: "#FFF",
                        },
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}