# Despliegue free: Vercel + Supabase

Guía para subir **Buró de oficios** sin pagar. Tú creas las cuentas; el proyecto ya está preparado para ese stack.

## 1. Supabase (base, auth y fotos)

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Elige una región cercana (por ejemplo `East US` o la de Sudamérica si aparece).
3. Guarda la contraseña de la base: la vas a necesitar.

### Connection strings

En **Project Settings → Database**:

| Variable | Qué copiar |
|---|---|
| `DATABASE_URL` | **Connection string** del **Transaction pooler** (puerto `6543`). Al final agrega `?pgbouncer=true`. |
| `DIRECT_URL` | **Connection string** **Direct** (puerto `5432`), sin pgbouncer. |

Ejemplo (cambia ref, región y password):

```bash
DATABASE_URL=postgresql://postgres.TU_REF:TU_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.TU_REF:TU_PASSWORD@aws-0-us-east-1.supabase.com:5432/postgres
```

Si la URL tiene caracteres especiales en la contraseña, codifícalos (`@` → `%40`, etc.).

### API keys

En **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` → Project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `anon` `public`  
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role` (**nunca** la expongas en el cliente)

### Auth

En **Authentication → Providers**:

1. Activa **Email**.
2. (Opcional) Activa **Google** y pega Client ID / Secret.
3. En **URL Configuration**, pon:
   - Site URL: `https://TU-PROYECTO.vercel.app`
   - Redirect URLs: `https://TU-PROYECTO.vercel.app/auth/callback`

### Storage (fotos de evidencia)

1. **Storage → New bucket**
2. Nombre exacto: `evidencias`
3. Márcalo **Public**
4. Si el bucket no existe, la app intenta crearlo con la service role; créalo a mano por si las políticas lo bloquean.

Política mínima recomendada (bucket público de lectura):

- Lectura pública: `true` para `SELECT`
- Escritura: solo con `service_role` (la app sube con esa clave)

## 2. Migraciones y seed (desde tu máquina)

Con `.env.production` ya apuntando a Supabase:

```bash
# Esquema
npm run db:migrate:prod

# Oficios (recomendado)
npm run db:seed:prod

# Catálogo postal (opcional; pesa y el free de Supabase es ~500 MB)
# npm run db:import-sepomex:prod
```

Comprueba que no falte nada:

```bash
npm run check:deploy
```

## 3. Vercel (la app)

1. Sube el repo a GitHub (si aún no tiene remote).
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. Framework: **Next.js** (detectado solo).
4. En **Environment Variables** (Production) agrega:

| Nombre | Valor |
|---|---|
| `APP_ENV` | `production` |
| `DATABASE_URL` | pooler de Supabase (`?pgbouncer=true`) |
| `DIRECT_URL` | conexión directa de Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role |
| `NEXT_PUBLIC_SITE_URL` | `https://TU-PROYECTO.vercel.app` |
| `ADMIN_EMAILS` | tu correo (admin) |
| `SESSION_SECRET` | cadena larga aleatoria |
| `GOOGLE_MAPS_API_KEY` | opcional |

5. Deploy.
6. Cuando Vercel te dé la URL final, actualiza `NEXT_PUBLIC_SITE_URL` y las redirect URLs de Supabase Auth, y vuelve a desplegar.

## 4. Prueba rápida en producción

1. Abre la URL de Vercel.
2. Crea cuenta / entra.
3. Publica una opinión con foto (debe subir a Storage `evidencias`).
4. Busca el proveedor en la home.

## 5. SEO y agentes de IA

Con `NEXT_PUBLIC_SITE_URL` correcto quedan activos:

- `/sitemap.xml` — Google / Bing
- `/robots.txt` — crawlers web + GPTBot, OAI-SearchBot, ClaudeBot, etc.
- `/llms.txt` y `/llms-full.txt` — mapa para agentes
- `/contexto.md` — contexto del sitio en Markdown
- `/feed.xml` — opiniones recientes
- `/proveedores/{id}/md` y `/oficios/{slug}/md` — fichas limpias para IA
- Open Graph + JSON-LD (Organization, WebSite, LocalBusiness, Review)

Opcional en Vercel: `GOOGLE_SITE_VERIFICATION` y `BING_SITE_VERIFICATION`. Luego envía el sitemap en [Google Search Console](https://search.google.com/search-console).

## Límites del plan free (importante)

- **Supabase Free**: ~500 MB de base, ~1 GB Storage; el proyecto puede **pausarse** si no hay actividad ~7 días (se reactiva al entrar al dashboard).
- **Vercel Hobby**: suficiente para demos y tráfico bajo; no uses el plan free para datos críticos sin backups.
- El import completo de SEPOMEX puede acercarse al tope de 500 MB: en free conviene seed de oficios y, si hace falta, un catálogo postal reducido.

## Comandos útiles

```bash
npm run check:deploy          # valida .env.production
npm run db:migrate:prod       # aplica migraciones a Supabase
npm run db:seed:prod          # oficios
npm run build                 # build igual que en Vercel (con prisma generate)
```
