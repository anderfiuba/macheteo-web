# macheteo-web

Frontend de Macheteo (Next.js 15 App Router + TypeScript + Tailwind v4 + Supabase Auth vía `@supabase/ssr`).

```bash
cp .env.example .env.local   # completar URL/key de Supabase; sin ellas corre en "modo demo"
npm install && npm run dev
```

- `src/lib/api/` — interfaz `MacheteoApi` con `mockApi` (localStorage) y `supabaseApi` (RPC propuestas). Se elige con `NEXT_PUBLIC_API_MODE`.
- `src/lib/supabase/` — clientes browser/server + refresco de sesión en `src/middleware.ts` (protege `/nuevo`, `/resumenes`, etc.).
- Rutas: `/` (→ `/nuevo`; landing más adelante), `/registro`, `/verificar`, `/ingresar`, `/recuperar`, `/recuperar/nueva`, `/auth/callback`, `/nuevo` (formulario en una pantalla + "Así va a salir"), `/resumenes/[id]`, `/biblioteca`, `/perfil`, `/terminos`, `/privacidad`.
- Identidad "Birome" (design-tokens v1): `src/app/globals.css`; Young Serif + Instrument Sans (`next/font`). Donación estática por env vars `NEXT_PUBLIC_DONACION_*` (sin ellas: datos de EJEMPLO).
- Mock N-19: incluí `#tope`, `#timeout` o `#falla` en los apuntes para simular errores.
- Contrato con Backend: `docs/endpoints-backend.md`.
