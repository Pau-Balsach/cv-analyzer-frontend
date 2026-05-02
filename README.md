# CV Analyzer — Frontend

Frontend de la aplicación **AI CV Analyzer**, una herramienta web que analiza CVs con inteligencia artificial y devuelve feedback accionable para mejorarlos.

🔗 **Demo en vivo:** [cv-analyzer-frontend.vercel.app](https://cvanalyzer-ai.vercel.app)

---

## ¿Qué hace?

- El usuario sube su CV en formato PDF
- El frontend lo envía al backend (Spring Boot) vía API REST
- Mientras la IA procesa el CV, hace polling automático cada 3 segundos
- Cuando el análisis termina, muestra:
  - **Score global** del CV (0–100)
  - **Puntos fuertes** detectados
  - **Puntos débiles** a mejorar
  - **Sugerencias concretas** de mejora
  - **Keywords ATS** que faltan en el CV

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 14 (App Router) | Framework frontend |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos |
| Supabase JS | Autenticación y sesión de usuario |

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Landing / página principal |
| `/login` | Inicio de sesión con Supabase Auth |
| `/register` | Registro de nuevo usuario |
| `/dashboard` | Subida del CV (drag & drop) |
| `/dashboard/result/[id]` | Resultado del análisis |

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_API_URL=https://cv-analyzer-backend-rh2s.onrender.com
```

---

## Repositorio del backend

El backend está desarrollado en Spring Boot y desplegado en Render:
👉 [cv-analyzer-backend](https://github.com/Pau-Balsach/cv-analyzer-backend)