# Gestor Tintas — Frontend Web
 
Interface web administrativa do **Gestor Tintas**, sistema de gestão operacional para lojas de tintas. A aplicação centraliza estoque, vendas, produção, fórmulas, clientes, fornecedores e pedidos, além de acompanhar a pesagem em tempo real via integração IoT (ESP32 → MQTT).
 
Desenvolvido pela equipe **NPSV** como projeto aplicado (SENAI Anchieta · 2025–2026).
 
---
 
## Sumário
 
- [Visão geral](#visão-geral)
- [Stack tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Instalação e execução](#instalação-e-execução)
- [Build de produção](#build-de-produção)
- [Deploy (Firebase Hosting)](#deploy-firebase-hosting)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Módulos da aplicação](#módulos-da-aplicação)
- [Integração com o backend](#integração-com-o-backend)
- [Integração IoT / MQTT](#integração-iot--mqtt)
- [Autenticação e perfis](#autenticação-e-perfis)
- [Equipe](#equipe)
---
 
## Visão geral
 
O frontend é uma SPA (Single Page Application) em **React**, empacotada com **Parcel**. Consome a API REST do backend (Spring Boot) autenticada via **JWT** e assina tópicos **MQTT** sobre WebSocket para exibir leituras de pesagem em tempo real na Aba da Máquina.
 
---
 
## Stack tecnológica
 
| Categoria | Tecnologia |
|-----------|------------|
| Biblioteca UI | React 18 |
| Componentes/Design | MUI (Material UI) 7 + Emotion |
| Roteamento | React Router DOM 6 |
| Bundler | Parcel 2 |
| Mensageria IoT | mqtt.js 5 (WebSocket) |
| Ícones | MUI Icons + lucide-react |
| Integrações | Firebase 12 |
| Hospedagem | Firebase Hosting |
 
---
 
## Pré-requisitos
 
Antes de começar, garanta que possui instalado:
 
- **Node.js** ≥ 18 (recomendado LTS 20+)
- **npm** ≥ 9 (acompanha o Node.js)
- Acesso à **API do backend** em execução (local ou em nuvem)
- *(Opcional, para IoT)* Um **broker MQTT** com WebSocket habilitado (ex.: Mosquitto na porta `9001`)
- *(Opcional, para deploy)* **Firebase CLI** (`npm install -g firebase-tools`)
Verifique as versões:
 
```bash
node -v
npm -v
```
 
---
 
## Variáveis de ambiente
 
A aplicação lê as configurações de um arquivo `.env` na raiz do repositório. Crie-o a partir do exemplo abaixo:
 
```env
# URL base da API REST do backend
API_BASE_URL=https://gestor-tintas-backend-api.onrender.com
 
# Endpoint do broker MQTT via WebSocket
MQTT_URL=ws://localhost:9001
 
# Tópico MQTT assinado pela Aba da Máquina
MQTT_TOPIC=gestor-tintas/pesagem
```
 
| Variável | Descrição | Valor padrão (fallback no código) |
|----------|-----------|-----------------------------------|
| `API_BASE_URL` | URL base da API REST consumida pelo frontend. | `http://localhost:8080` |
| `MQTT_URL` | Endereço do broker MQTT sobre WebSocket. | `ws://localhost:9001` |
| `MQTT_TOPIC` | Tópico de pesagem assinado em tempo real. | `gestor-tintas/pesagem` |
 
> **Observação:** os valores de fallback estão definidos em `src/services/api.js` e `src/pages/machine/MachinePage.jsx`. Para desenvolvimento local apontando ao backend na sua máquina, use `API_BASE_URL=http://localhost:8080`.
 
> **Segurança:** não comite arquivos `.env.local`, `.env.production.local` etc. — eles já estão no `.gitignore`.
 
---
 
## Instalação e execução
 
```bash
# 1. Clone o repositório
git clone <url-do-repositorio-frontend>
cd npsv-gestor-tintas-frontend
 
# 2. Instale as dependências
npm install
 
# 3. Crie o arquivo .env (ver seção acima)
#    e ajuste as variáveis conforme seu ambiente
 
# 4. Inicie o servidor de desenvolvimento
npm start
```
 
O Parcel iniciará o servidor de desenvolvimento (por padrão em `http://localhost:1234`) com hot reload. O endereço exato é exibido no terminal.
 
---
 
## Build de produção
 
```bash
npm run build
```
 
Os arquivos otimizados são gerados na pasta `dist/`, prontos para hospedagem estática.
 
---
 
## Deploy (Firebase Hosting)
 
O projeto está configurado para deploy no Firebase Hosting (`firebase.json` aponta para a pasta `dist`).
 
```bash
# 1. Faça login (apenas na primeira vez)
firebase login
 
# 2. Gere o build de produção
npm run build
 
# 3. Publique
firebase deploy
```
 
O projeto padrão configurado é `npsv-gestor-tintas-front-ba401` (ver `.firebaserc`). O Hosting usa rewrite de SPA, redirecionando todas as rotas para `index.html`.
 
---
 
## Estrutura do projeto
 
```
.
├── index.html                 # Entry point HTML
├── firebase.json              # Configuração de hosting
├── .firebaserc                # Projeto Firebase padrão
├── package.json               # Dependências e scripts
└── src/
    ├── main.jsx               # Bootstrap React (tema, providers, router)
    ├── App.jsx                # Definição das rotas
    ├── assets/                # Imagens, logos, vídeo de pitch, QR code
    ├── components/
    │   ├── common/            # AppDataTable, AppFormDialog, AppTextField, etc.
    │   ├── feedback/          # Snackbar, EmptyState, LoadingState
    │   ├── form/              # FieldLabel, FieldError
    │   └── layout/            # AdminLayout (sidebar + topbar)
    ├── context/               # AuthContext, ColorModeContext
    ├── lib/                   # problemDetail, formPatterns (helpers)
    ├── pages/                 # Uma pasta por módulo (ver abaixo)
    ├── routes/                # ProtectedRoute (guarda de rotas)
    ├── services/api.js        # Cliente HTTP + endpoints do backend
    ├── styles/                # global.css, auth.css
    └── theme/theme.js         # Tema MUI (claro/escuro)
```
 
---
 
## Módulos da aplicação
 
| Rota | Página | Descrição | Acesso |
|------|--------|-----------|--------|
| `/` | Landing | Página pública de apresentação do projeto. | Público |
| `/login` | Login | Autenticação de usuários. | Público |
| `/dashboard` | Home | Indicadores resumidos de vendas e produções. | Autenticado |
| `/categorias-produtos` | Categorias | CRUD de categorias de produtos. | Autenticado |
| `/produtos` | Produtos | CRUD de produtos e controle de estoque. | Autenticado |
| `/formulas` | Fórmulas | CRUD de fórmulas e seus insumos. | Autenticado |
| `/aba-maquina` | Máquina | Pesagem em tempo real via MQTT/ESP32. | COLORISTA, ADMIN |
| `/historico-producao` | Produções | Ciclo de produção das fórmulas. | Autenticado |
| `/vendas` | Vendas | Registro e histórico de vendas. | Autenticado |
| `/clientes` | Clientes | CRUD de clientes. | Autenticado |
| `/fornecedores` | Fornecedores | CRUD de fornecedores. | Autenticado |
| `/pedidos` | Pedidos | Pedidos de compra a fornecedores. | Autenticado |
| `/usuarios` | Usuários | Gestão de acessos e perfis. | Autenticado |
 
---
 
## Integração com o backend
 
Toda comunicação HTTP está centralizada em `src/services/api.js`:
 
- O token JWT é armazenado no `localStorage` e injetado no header `Authorization: Bearer <token>` em cada requisição autenticada.
- Os endpoints REST exigem JWT; o tratamento de erros segue o padrão *Problem Detail* (`detail`, `title`, `message`), normalizado em `src/lib/problemDetail`.
- A base da API é definida por `API_BASE_URL`.
---
 
## Integração IoT / MQTT
 
A página **Aba da Máquina** (`src/pages/machine/MachinePage.jsx`) conecta-se ao broker MQTT por WebSocket usando `mqtt.js`:
 
- Assina o tópico definido em `MQTT_TOPIC`.
- Recebe payloads de pesagem (peso lido, item/ordem, timestamp) e atualiza a interface em tempo real.
- O publicador físico é um **ESP32** que envia leituras da balança; a publicação MQTT não requer JWT.
Para testar localmente sem o hardware, é possível publicar mensagens manualmente no tópico através de um broker MQTT local com WebSocket habilitado.
 
---
 
## Autenticação e perfis
 
- **Login** via `/auth/login` retorna o token JWT.
- Rotas privadas são protegidas por `ProtectedRoute`, que valida a autenticação e, quando aplicável, o perfil (`allowedRoles`).
- Perfis suportados: **ADMIN**, **COLORISTA** e **VENDEDOR**. A Aba da Máquina é restrita a COLORISTA e ADMIN.
---
 
## Equipe
 
Projeto **NPSV — Gestor Tintas** · SENAI Anchieta · 2025–2026
 
- **Victor Mordachini** — Scrum Master · Product Owner · IoT
- **Samuel Correia** — Backend
- **Nicolas Moura** — Frontend Web
- **Pedro Pina** — Mobile
> © 2026 Equipe NPSV. Todos os direitos relacionados ao projeto Gestor Tintas são reservados aos integrantes do grupo.
