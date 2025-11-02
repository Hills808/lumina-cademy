# Sistema Acadêmico Colaborativo com Apoio de IA

## PIM II - Projeto Integrado Multidisciplinar
**Curso:** CST em Análise e Desenvolvimento de Sistemas  
**Instituição:** UNIP - Universidade Paulista  
**Período:** 2025/2

## 📋 Sobre o Projeto

Este projeto é um Sistema Acadêmico Colaborativo que integra funcionalidades de gerenciamento educacional com recursos de Inteligência Artificial. O sistema foi desenvolvido como parte do Projeto Integrado Multidisciplinar (PIM), explorando práticas modernas de engenharia de software ágil.

## 🎯 Objetivos

### Objetivo Geral
Projetar e implementar um sistema acadêmico integrado que permita gerenciar turmas, alunos, aulas e atividades, com funcionalidades de colaboração, explorando práticas de engenharia de software ágil e uso de recursos de Inteligência Artificial.

### Objetivos Específicos
- Gerenciamento completo de turmas e matrículas
- Sistema de materiais didáticos com suporte a vídeos
- Criação e aplicação de quizzes avaliativos
- Calendário acadêmico integrado
- Assistente virtual com IA para suporte aos usuários
- Interface responsiva e intuitiva

## 🚀 Funcionalidades

### Para Professores
- ✅ Criação e gerenciamento de turmas
- ✅ Upload e organização de materiais didáticos
- ✅ Criação de quizzes e avaliações
- ✅ Gestão de calendário acadêmico
- ✅ Visualização de desempenho dos alunos
- ✅ Assistente de IA para auxílio pedagógico

### Para Alunos
- ✅ Matrícula em turmas via código
- ✅ Acesso a materiais didáticos
- ✅ Realização de quizzes
- ✅ Visualização de calendário de eventos
- ✅ Dashboard com estatísticas de desempenho
- ✅ Assistente de IA para dúvidas e suporte

## 💻 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Edge Functions** - Funções serverless
- **Row Level Security (RLS)** - Segurança de dados

### Inteligência Artificial
- **Gemini 2.5** - Modelo para assistente virtual
- **GPT-5** - Modelos para funcionalidades avançadas de IA

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Navegue até o diretório
cd <NOME_DO_PROJETO>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📦 Estrutura do Projeto

```
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes UI do shadcn
│   │   ├── AppSidebar.tsx # Barra lateral de navegação
│   │   └── Navbar.tsx     # Barra de navegação
│   ├── pages/             # Páginas da aplicação
│   │   ├── Login.tsx      # Autenticação
│   │   ├── Cadastro.tsx   # Registro de usuários
│   │   ├── Dashboard.tsx  # Painel principal
│   │   ├── Turmas.tsx     # Gerenciamento de turmas
│   │   ├── Materiais.tsx  # Materiais didáticos
│   │   ├── Quizzes.tsx    # Sistema de avaliações
│   │   ├── Calendario.tsx # Calendário acadêmico
│   │   └── Assistente.tsx # Assistente com IA
│   ├── integrations/      # Integrações externas
│   │   └── supabase/      # Cliente Supabase
│   └── lib/               # Utilitários e helpers
├── supabase/              # Configurações do backend
│   └── functions/         # Edge Functions
└── public/                # Arquivos estáticos
```

## 🗃️ Banco de Dados

### Tabelas Principais
- **profiles** - Perfis de usuários
- **user_roles** - Papéis (aluno/professor)
- **classes** - Turmas
- **class_enrollments** - Matrículas
- **materials** - Materiais didáticos
- **quizzes** - Avaliações
- **quiz_questions** - Questões dos quizzes
- **quiz_options** - Opções de resposta
- **quiz_attempts** - Tentativas de resolução
- **calendar_events** - Eventos do calendário

## 🔐 Segurança

O sistema implementa:
- Autenticação via email/senha
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso baseadas em papéis
- Validação de dados no frontend e backend
- Proteção contra SQL Injection

## 👥 Equipe

Projeto desenvolvido por alunos do curso de Análise e Desenvolvimento de Sistemas da UNIP.

## 📄 Licença

Este projeto é parte do PIM II da UNIP e segue as diretrizes acadêmicas da instituição.

---

**⚠️ Nota Importante:** Este trabalho segue rigorosamente as normas ABNT e é 100% original. Plágio será reprovado conforme diretrizes do PIM.
