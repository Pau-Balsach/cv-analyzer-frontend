# CV Analyzer — Frontend

Aplicación web que analiza CVs con IA y devuelve feedback accionable para mejorarlos.

🔗 **Demo:** [cvanalyzer-ai.vercel.app](https://cvanalyzer-ai.vercel.app) · **Backend:** [cv-analyzer-backend](https://github.com/Pau-Balsach/cv-analyzer-backend)

---

## ¿Qué hace?

1. El usuario sube su CV en PDF (drag & drop)
2. El frontend lo envía al backend y recibe un `analysisId`
3. Hace polling automático cada 3 segundos hasta que el análisis termina
4. Muestra el resultado completo:
   - **Score global** animado (0–100)
   - **Puntos fuertes y débiles**
   - **Sugerencias de mejora** concretas
   - **Keywords ATS** que faltan en el CV
   - **Análisis por sección** (experiencia, educación, skills, formato)
   - **Job Matching** — compara el CV contra una oferta de trabajo
   - **Historial** de análisis anteriores

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos |
| Supabase JS | Autenticación y gestión de sesión |

---

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/dashboard` | Subida del CV |
| `/dashboard/result/[id]` | Resultado del análisis |
| `/history` | Historial de análisis |

---

## Setup local

**Requisitos:** Node.js 18+, cuenta en [Supabase](https://supabase.com)

```bash
git clone https://github.com/Pau-Balsach/cv-analyzer-frontend.git
cd cv-analyzer-frontend
npm install
```

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=https://cv-analyzer-backend-rh2s.onrender.com
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Estructura del proyecto
 
```
app/
├── dashboard/
│   ├── page.tsx                          # Subida del CV (drag & drop)
│   └── result/
│       └── page.tsx                      # Resultado del análisis
├── history/
│   ├── page.tsx                          # Historial de análisis
│   └── job-match/
│       └── [jobMatchId]/
│           └── page.tsx                  # Detalle de un job match
├── login/
│   └── page.tsx                          # Inicio de sesión
├── register/
│   └── page.tsx                          # Registro
├── layout.tsx
└── page.tsx                              # Landing page
 
lib/
├── api.ts                                # Llamadas al backend (fetch + headers)
├── supabase.ts                           # Cliente Supabase
├── types.ts                              # Tipos TypeScript compartidos
└── useLocale.ts                          # Hook de internacionalización
 
messages/
├── en.json                               # Traducciones en inglés
└── es.json                               # Traducciones en español
```
 

---

## Decisiones técnicas

**Polling en lugar de WebSocket** — El free tier de Render no garantiza conexiones persistentes. El cliente hace `GET /api/analysis/{id}` cada 3 segundos y navega automáticamente cuando `status === COMPLETED`. Sencillo, fiable y sin dependencias extra.

**`X-User-Id` en cada request** — Todos los fetch al backend incluyen el `userId` de la sesión Supabase en el header `X-User-Id`. El backend valida que coincide con el dueño del recurso antes de responder, añadiendo una capa de seguridad sobre el JWT.

**Skeleton loaders** — Las páginas de resultado e historial muestran placeholders animados mientras cargan los datos, evitando flashes de contenido vacío.

**Toast de errores** — Los errores se muestran como toasts flotantes que desaparecen solos a los 5 segundos, sin bloquear la UI ni requerir que el usuario cierre un modal.

---

## Variables de entorno (producción — Vercel)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |
| `NEXT_PUBLIC_API_URL` | URL del backend en Render |

---

## Licencia

MIT