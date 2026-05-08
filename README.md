# Hacedor 3D

Monorepo e-commerce: **frontend** (Vite + React 18) y **backend** (Express + Prisma).

## Requisitos

- Node.js LTS
- PostgreSQL (para Prisma)

## Desarrollo

```bash
cd backend && npm install && cp .env.example .env
cd ../frontend && npm install
```

Variables de entorno: ver `backend/.env.example` y documentación en `CLAUDE.md`.

## Scripts

| Carpeta   | Comando   | Descripción        |
| --------- | --------- | ------------------ |
| `frontend/` | `npm run dev` | Vite (por defecto :5173) |
| `backend/`  | `npm run dev` | API con nodemon + ts-node |

## Documentación del producto

Contexto completo del stack, diseño y API: `CLAUDE.md`.

## shadcn/ui

El ecosistema **shadcn/ui** se gestiona con el CLI **`shadcn`** (dependencia en el frontend). Después de instalar:

```bash
cd frontend && npx shadcn@latest init
```
