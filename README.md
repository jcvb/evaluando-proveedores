# Buró de oficios

Opiniones con fotos sobre maestros y oficios en México (Next.js + Prisma + Postgres).

## Local

```bash
cp .env.example .env.development
# Ajusta si hace falta; por defecto usa Docker en :54329

npm install
npm run up
```

`npm run up` levanta Postgres de desarrollo, migra, hace seed y arranca Next.js en [http://localhost:3000](http://localhost:3000).

- Dev DB: contenedor `proveedores-pg-dev` → puerto **54329**
- Prod local (opcional): `proveedores-pg-prod` → puerto **54330**

## Deploy free (Vercel + Supabase)

Sigue la guía paso a paso en [`DEPLOY.md`](./DEPLOY.md).

```bash
npm run check:deploy
npm run db:migrate:prod
npm run db:seed:prod
```
