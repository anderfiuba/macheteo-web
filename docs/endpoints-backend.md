# Macheteo: contrato Frontend ↔ Backend v2 (pivot gratuito, 2026-10-09)

Todo va por Supabase (PostgREST/RPC con el JWT del usuario + RLS). Migraciones: `macheteo-backend/supabase/migrations/`.
Versión anterior (créditos): `endpoints-backend.v1-creditos.md`. **Se quitan** `obtener_saldo`, `costos_extension`, saldo, reservas, MP, historial y arrepentimiento.

| # | Necesidad | Implementación | Respuesta / notas | Historias |
|---|---|---|---|---|
| 1 | Uso del día (reemplaza saldo) | RPC `obtener_uso()` | `{ email_verificado, machetes_hoy, machetes_limite, machetes_restantes, hojas_hoy, hojas_limite, hojas_restantes, en_curso, en_curso_limite, proximo_cupo_at (timestamptz \| null, solo si llegó al límite), errores_usuario_hoy, errores_usuario_limite, bloqueado_hasta (timestamptz \| null: 00:00 ART siguiente si llegó a 3 errores propios), limite_global_alcanzado }` | LU-01, LU-02, NR-04, DO-04 |
| 2 | Largos | Tabla `largos` (lectura pública, anon) | `[{ extension, hojas_max }]`: machete 2 · corto 4 · medio 8 · completo 16 | NR-04 |
| 3 | Armar mi machete | **Route handler de Next** `POST /api/machetes` (N-04): valida el JWT (`auth.getUser()`), calcula `p_ip_hashes text[] = [HMAC(IP_HASH_SECRET, prefijo), HMAC(IP_HASH_SECRET_ANTERIOR, prefijo)]` (prefijo de x-real-ip: /32 v4 · /64 v6; el 2º hash solo durante las 24 h de solapamiento tras rotar la clave; sin header IP → `[]`/null = bucket `desconocido` con su propio límite, fail-closed, N-18) y llama con service_role a `crear_resumen(p_user_id, p_ip_hashes, p_apuntes, p_instrucciones, p_tipo, p_extension, p_diseno, p_tinta, p_opciones jsonb, p_idempotency_key uuid)`. El usuario **no** puede llamar la RPC directo | OK: `{ resumen_id, estado, hojas_max }`. Error (mensaje exacto): `email_no_verificado` · `terminos_no_aceptados` · `validacion` · `limite_errores` (N-03, DETAIL `{vuelve_at}`) · `limite_activos` · `limite_diario` (DETAIL JSON `{vuelve_at, machetes_restantes, hojas_restantes}` o `{motivo:"ip"\|"ip_desconocida"}`) · `limite_global` · `cuenta_inexistente` (N-11). `p_opciones.materia` es obligatoria (1–60); `nombre_en_hojas` y `fecha` van en `p_opciones`. `p_diseno`/`p_tinta` null usan los defaults del perfil. "Machete de 1 hoja" fuerza `machete` sin avisar. Misma key, misma respuesta. | NR-01..07, LU-01/02 |
| 3b | Reintentar | Mismo route handler → `reintentar_resumen(p_user_id, p_ip_hashes, p_resumen_id, p_idempotency_key)` (service_role) | Solo para un machete propio en `error`. Crea un job nuevo con los mismos apuntes (`reintento_de`) y aplica los mismos límites y errores. | GE-03, GE-04 |
| 4 | Estado del job | `select` explícito en `resumenes` (RLS dueño): `id, estado, progreso, tipo, extension, diseno, tinta, materia, opciones, hojas_max, paginas, error_codigo, error_origen (`usuario \| plataforma`: los de usuario no cuentan para el límite diario pero sí para el tope de 3/día ART; los de plataforma no cuentan para nada), en_cola_at, listo_at, error_at, created_at` + Realtime (`supabase_realtime`) | Estados `en_cola \| generando \| armando \| listo \| error`. **`select=*` falla** por privilegios de columna (apuntes, costos y error interno están ocultos). | GE-03, BI-01 |
| 5 | Descarga | Edge Function `url_descarga_resumen` → `supabase.functions.invoke('url_descarga_resumen', { body: { p_resumen_id } })` | `{ url }` firmada por 5 min con nombre `Macheteo - {Materia} - {Tipo} - {fecha}.pdf`. Errores 401/404/409 (`no_listo`). | GE-03, BI-02 |
| 6 | Perfil | `select` explícito en `perfiles`: `nombre, email, nombre_en_hojas, hoja_default, tinta_default, avisar_email, acepto_terminos_at, version_terminos, email_verificado_at`. `update` solo de `nombre, nombre_en_hojas, hoja_default, tinta_default, avisar_email`. RPC `mis_materias()` → `text[]` | `ip_registro` y `limite_override` no son visibles. | DO-04, NR-06 |
| 7 | Registro T&C | Trigger en `auth.users` que lee `raw_user_meta_data.acepto_terminos` (bool) y `version_terminos`. Google: RPC `aceptar_terminos(p_version)` | | CU-01, CU-02 |
| 8 | Reportar error | `insert` en `reportes (resumen_id, motivo, texto)` | motivo: `contenido_incorrecto \| falto_tema \| diseno_roto \| otro` | BI-03 |
| 9 | Eliminar cuenta | Edge Function `eliminar_cuenta` (verify_jwt, usuario de la sesión): `functions.invoke("eliminar_cuenta", { body: { confirmar: "ELIMINAR" } })` → `200 { ok, ya_eliminada, pdfs_borrados }` · `400 confirmacion_requerida` · `401` · `500 { error_interno, paso }` (idempotente: reintentar). Después: `signOut({ scope: "local" })` y landing con aviso. | Cancela los jobs en curso, borra perfil (cascade), Storage `resumenes/{user_id}/`, signOut global y deleteUser. Solo quedan agregados anónimos. Sin mail de baja todavía (dominio de Resend). | CU-06 |
| 10 | Donación | **Sin backend.** `DONACION_ALIAS`, `DONACION_CVU`, `DONACION_TITULAR`, `DONACION_ACTIVA` en Vercel y `public/donacion-qr.png` | | DO-01 |
| 11 | Auth | Site URL y Redirect URLs `{SITE_URL}/auth/callback`. Plantillas → `/auth/callback?token_hash={{ .TokenHash }}&type=...`. Google habilitado. Captcha: site key al front | Pendiente de dashboard (ver README) | CU-01..04, CU-07 |

Enums: `tipo` = `ejercicios | teoria | machete | autoevaluacion` · `extension` = `machete | corto | medio | completo` · `diseno` = `rayado | cuadriculado | punteado` · `tinta` = `azul | negro | verde | violeta`.

---

## Notas del Front (macheteo-web, 2026-10-09 · alineado con migración `20261009071000_front_500c24f_y_growth`)

**Implementado:** `src/lib/api/supabase.ts` (select explícitos en `resumenes`/`perfiles`, `obtener_uso`, `mis_materias`, `url_descarga_resumen` vía `functions.invoke`, `declarar_donacion`, `registrar_evento`) y route handlers:
- `POST /api/machetes` (#3/#3b): `{…, idempotency_key}` → `crear_resumen`; `{reintentar_de, idempotency_key}` → `reintentar_resumen`. JWT con `auth.getUser()`, `p_ip_hashes` de `x-real-ip` (`IP_HASH_SECRET` [+ `IP_HASH_SECRET_ANTERIOR`]), service role server-only. Responde `{ error, vuelve_at, motivo }` con los códigos exactos de la RPC (DETAIL JSON).
- `GET /api/machetes/[id]/pedido` (PA-13, "Editar y reintentar"): RPC **`obtener_pedido_resumen(p_id)` con la sesión del usuario** (sin service role) → apuntes + opciones solo si es dueño, está en `error` y ≤ 7 días; si no, `no_encontrado` → 404. Fallback: copia local del dispositivo.

**Env server-only en Vercel:** `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SECRET`, `IP_HASH_SECRET_ANTERIOR` (solo 24 h tras rotar).

**Confirmado por Backend:**
1. **Límites (PA-16):** 16 hojas por día calendario ART; cada machete cobra su largo (2/4/8/16); **sin tope de machetes** (`machetes_limite = 0`); 1 en curso; 3 fallos de usuario/día ART (`limite_errores`, vuelve 00:00 ART). `limite_diario` trae `motivo`: `hojas` (cuenta) · `ip` · `ip_desconocida`.
2. **Tope global (LU-02):** USD 10/día. `obtener_uso` → `limite_global_alcanzado` + `limite_global_vuelve_at` (00:00 ART); `crear_resumen` → `limite_global` con DETAIL `{vuelve_at}`. El front muestra un aviso amable ("Hoy se armaron tantos machetes que Macheteo llegó a su límite del día… Mañana a las 00:00 podés volver a armar"), nunca condicionado a donar.
3. **Intentos restantes (N-19):** `errores_usuario_limite − errores_usuario_hoy`. Error de contenido = `error_origen = 'usuario'` (o `tope_costo`/`render_timeout`).
4. **`declarar_donacion(p_monto)`** → `{ ok: true }`; repetido el mismo día → `ya_declarada_hoy`.
5. **`registrar_evento(p_nombre, p_props)`** (allowlist + rate limit). Cliente: `machete_iniciado` (aceptado), `pdf_descargado`, `limite_alcanzado`, `preferencia_mail_cambiada`, `donacion_cta_visto`, `donacion_abierta`, `donacion_alias_copiado`, `donacion_cvu_copiado`, `donacion_qr_mostrado`. `machete_enviado/listo/error` y `donacion_autodeclarada` son server-side.
6. **Donación (#10):** defaults reales en `src/lib/config.ts` (alias `macheteo.donacion.mp`, titular Anderson Cavalcante Brayner; sin CVU ni QR → ocultos). `NEXT_PUBLIC_DONACION_*` los pisan; `NEXT_PUBLIC_DONACION_ACTIVA=false` oculta todo.

**Contrato v4 (Backend, aplicado en `eqxijsigccdetocnklvj`):**
- DETAIL de `limite_diario` = `{ vuelve_at, motivo: hojas|ip|ip_desconocida, hojas_restantes }`; `limite_global` y `limite_errores` = `{ vuelve_at }`. `obtener_uso` agrega `limite_global_vuelve_at`.
- Estado (#4): el front lee además `largo` (columna generada; **no viene por Realtime**, el front hace polling con `select`) e `intentos_restantes_hoy` (foto al fallar; en vivo se usa `obtener_uso`).
- `excede_hojas` (N-20) = error de **plataforma** → mensaje genérico + "Reintentar", no cuenta.
- Descarga (#5): `url_descarga_resumen` devuelve la URL firmada con nombre `materia-tipo-AAAA-MM-DD.pdf` (slug sin tildes, fecha de creación ART), p. ej. `analisis-ii-teoria-2026-10-09.pdf`.
- `registrar_evento` → `false` si pasó 300/día (se ignora en silencio); `validacion` si no está en la allowlist o props > 2 KB (el front no manda > 2 KB).
- `obtener_pedido_resumen(p_id)` → `{ apuntes, instrucciones, tipo, extension, diseno, tinta, materia, opciones }`.
- Auth: Google y SMTP todavía sin configurar. El botón de Google consulta `/auth/v1/settings` y, si está apagado, muestra "Entrar con Google todavía no está disponible. Usá tu email y contraseña." Si falla el envío del mail de verificación, el registro lo avisa en lugar de mandar a `/verificar`.

> Nota: `macheteo-backend/docs/contrato-frontend.md` v4 ya está alineado con estos nombres.
