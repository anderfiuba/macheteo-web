# macheteo-web

Frontend de Macheteo (Next.js 15 App Router + TypeScript + Tailwind v4 + Supabase Auth vía `@supabase/ssr`).

```bash
cp .env.example .env.local   # completar URL/key de Supabase; sin ellas corre en "modo demo"
npm install && npm run dev
```

- `src/lib/api/` — interfaz `MacheteoApi` con `mockApi` (localStorage) y `supabaseApi` (RPC propuestas). Se elige con `NEXT_PUBLIC_API_MODE`.
- `src/lib/supabase/` — clientes browser/server + refresco de sesión en `src/middleware.ts` (protege `/nuevo`, `/resumenes`, etc.).
- Rutas (alineadas a flows.md): `/`, `/registro`, `/verificar`, `/ingresar`, `/recuperar`, `/recuperar/nueva`, `/auth/callback`, `/biblioteca` (home logueada), `/nuevo?paso=1..5`, `/resumenes/[id]`, `/creditos`, `/creditos/historial`, `/cuenta`, `/terminos`, `/privacidad`, `/arrepentimiento`.
- Tokens de diseño: `src/app/globals.css` (de `/workspace/macheteo-design/design-tokens.md`); fuentes Inter + Kalam (`next/font`).
- Contrato con Backend: `docs/endpoints-backend.md`.
