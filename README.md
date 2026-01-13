<div align="center">
  <img src="public/pwa-512x512.png" alt="ArgusOne Logo" width="120" />
  <h1>ArgusOne Security</h1>
  
  <p>
    <strong>Sua Fortaleza Digital Privada e Segura.</strong>
  </p>
# React + TypeScript + Vite

  <p>
    <a href="#-sobre">Sobre</a> •
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-instalação">Instalação</a> •
    <a href="#-segurança">Arquitetura de Segurança</a>
  </p>
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

  <img src="https://img.shields.io/badge/Status-Versão%201.0-8b5cf6?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
</div>
Currently, two official plugins are available:

<br />
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

<img src="./screenshots/dashboard-preview.png" alt="ArgusOne Dashboard" width="100%" style="border-radius: 10px; border: 1px solid #334155;" />
## React Compiler

## 🛡️ Sobre
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

O **ArgusOne** é uma suíte de segurança pessoal desenvolvida como uma Aplicação Web Progressiva (PWA). O objetivo é fornecer ferramentas de cibersegurança acessíveis, intuitivas e, acima de tudo, privadas.
## Expanding the ESLint configuration

Diferente de gerenciadores comuns, o ArgusOne foca na **experiência do usuário (UX)** combinada com **criptografia robusta**, permitindo que o usuário gerencie sua vida digital tanto no Desktop quanto no Mobile com sensação de aplicativo nativo.
If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

## ✨ Funcionalidades
```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

- **🔐 Cofre de Senhas:** Armazenamento de credenciais com criptografia AES-256 (Client-Side).
- **💳 Carteira Digital:** Guarde dados de cartões e documentos sensíveis com visualização protegida.
- **🦠 Scanner de Ameaças:** Integração com APIs de inteligência (como VirusTotal) para verificar se URLs ou arquivos são maliciosos.
- **📝 Notas Seguras:** Bloco de notas criptografado para segredos, chaves privadas e códigos de recuperação.
- **📊 Dashboard Analítico:** Sistema de pontuação (Score) que gamifica sua segurança digital e alerta sobre vulnerabilidades.
- **📲 PWA (Progressive Web App):** Instalável no iOS, Android e Windows, com funcionamento offline e ícone nativo.
      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

## 🚀 Tecnologias

Este projeto foi construído utilizando as melhores práticas de desenvolvimento web moderno:

- **Frontend:** React.js, TypeScript
- **Build Tool:** Vite
- **Estilização:** CSS Modules (Variáveis CSS, Glassmorphism, Design Responsivo)
- **Backend/Auth:** Supabase (PostgreSQL, Row Level Security)
- **Criptografia:** CryptoJS (AES)
- **Ícones:** Lucide React
- **Integração PWA:** Vite PWA Plugin

## 🔒 Arquitetura de Segurança

A segurança é o pilar central do ArgusOne. O sistema utiliza uma abordagem **Zero-Knowledge** (Conhecimento Zero) sempre que possível:

1.  **Criptografia Client-Side:** As senhas e notas são criptografadas no navegador do usuário *antes* de serem enviadas ao banco de dados.
2.  **PIN Mestre:** Uma camada extra de proteção que garante que, mesmo se o dispositivo estiver desbloqueado, os dados sensíveis exigem uma segunda autenticação.
3.  **RLS (Row Level Security):** Regras estritas no banco de dados Supabase garantem que um usuário jamais consiga ler os dados de outro, mesmo com acesso direto à API.

## 📦 Instalação e Uso

Pré-requisitos: Node.js e NPM/Yarn instalados.

```bash
# 1. Clone o repositório
git clone [https://github.com/Bryanmdev/Argus-one.git](https://github.com/Bryanmdev/Argus-one.git)

# 2. Entre na pasta
cd argus-one

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz e adicione suas chaves do Supabase:
# VITE_SUPABASE_URL=sua_url
# VITE_SUPABASE_ANON_KEY=sua_chave

# 5. Rode o projeto
npm run dev
      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

<div align="center"> <p>Desenvolvido por <a href="https://www.google.com/search?q=https://linkedin.com/in/bryan-miraanda">Bryan Miranda</a></p> </div>
You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
