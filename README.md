# MedRecords Backend

Backend da plataforma **MedRecords**, implementado com **Node.js + Express + TypeScript + PostgreSQL (Prisma)**.

Este backend foi desenvolvido com base nos requisitos do documento da Fase 1 e inclui features adicionais para elevar qualidade de entrega (seguranca, rastreabilidade, documentacao e testes).

## Requisitos implementados (Fase 1)

- Cadastro de usuario com `username`, `email` e `password`.
- Login por email/senha.
- Cadastro e edicao de informacoes clinicas.
- Definicao e alteracao de senha publica separada da senha de login.
- Geracao de link e QR code para perfil publico.
- Acesso publico por slug + senha publica.
- Exclusao completa da conta (remove dados e invalida link publico).
- Validacao de dados com Zod.
- Endpoints de impressao separados para QR e senha publica.

## Features extras adicionadas

- Criptografia de campos clinicos em repouso (AES-256-GCM).
- Hash de senhas e tokens.
- JWT access + refresh token com revogacao.
- Rate limiting global + rotas sensiveis.
- Auditoria de tentativas de acesso publico (`PublicAccessAttempt`).
- Swagger/OpenAPI em `/docs`.
- Testes automatizados de utilitarios criticos.

## Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- JWT (`jsonwebtoken`)
- QRCode (`qrcode`)

## Estrutura

```txt
src/
  app.ts
  server.ts
  routes.ts
  config/
  middlewares/
  modules/
    auth/
    clinical/
    public/
    health/
  utils/
prisma/
  schema.prisma
  seed.ts
docs/
  openapi.yaml
tests/
```

## Setup local

1. Copie o arquivo de ambiente:
   - `cp .env.example .env` (Linux/macOS)
   - `Copy-Item .env.example .env` (PowerShell)
2. Configure `DATABASE_URL` para seu PostgreSQL local.
3. Defina `ENCRYPTION_KEY_BASE64` com uma chave de 32 bytes em base64.
4. Instale dependencias:
   - `npm install`
5. Gere o client Prisma:
   - `npm run prisma:generate`
6. Rode migracoes:
   - `npm run prisma:migrate`
7. (Opcional) Popular dados demo:
   - `npm run prisma:seed`
8. Iniciar API:
   - `npm run dev`

## Scripts

- `npm run dev`: executa em desenvolvimento.
- `npm run build`: compila TypeScript.
- `npm start`: inicia build compilada.
- `npm run prisma:generate`: gera Prisma Client.
- `npm run prisma:migrate`: cria/aplica migracoes locais.
- `npm run prisma:deploy`: aplica migracoes em ambiente alvo.
- `npm run prisma:seed`: cria usuario e perfil demo.
- `npm test`: roda testes.

## Endpoints principais

Base URL: `http://localhost:3000/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `DELETE /auth/me`
- `GET /clinical/me`
- `PUT /clinical/me`
- `PUT /public/password`
- `PUT /public/status`
- `GET /public/link`
- `GET /public/qr`
- `GET /public/print/qr`
- `POST /public/print/password`
- `POST /public/:slug/access`

Documentacao interativa:
- `GET /docs`

## Observacoes de seguranca

- Nunca armazene senhas em texto puro.
- Campos clinicos sao criptografados no banco.
- Use segredo forte para JWT e chave de criptografia valida.
- Em producao, aplique HTTPS, rotacao de segredos e monitoramento.
