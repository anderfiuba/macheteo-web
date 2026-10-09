# macheteo-web

Frontend de Macheteo (Next.js 15 App Router + TypeScript + Tailwind v4 + Supabase Auth vía `@supabase/ssr`).

```bash
cp .env.example .env.local   # completar URL/key de Supabase; sin ellas corre en "modo demo"
npm install && npm run dev
```

- `src/lib/api/` — interfaz `MacheteoApi` con `mockApi` (localStorage) y `supabaseApi` (RPC propuestas). Se elige con `NEXT_PUBLIC_API_MODE`.
- `src/lib/supabase/` — clientes browser/server + refresco de sesión en `src/middleware.ts` (protege `/nuevo`, `/resumenes`, etc.).
- Rutas: `/`, `/registro`, `/ingresar`, `/recuperar`, `/actualizar-contrasena`, `/auth/callback`, `/nuevo` (wizard 5 pasos), `/resumenes/[id]` (progreso), placeholders `/historial`, `/creditos`, `/biblioteca`.
- Contrato con Backend: `docs/endpoints-backend.md`.
