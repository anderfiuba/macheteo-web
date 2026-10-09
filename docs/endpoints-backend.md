# Macheteo — Contrato Frontend ↔ Backend (propuesta, a confirmar)

Todo vía Supabase (PostgREST/RPC con JWT del usuario + RLS). Nombres propuestos; el front los consume desde `src/lib/api/supabase.ts`
(interfaz `MacheteoApi` en `src/lib/api/types.ts`). Hoy corre con `mockApi` (`NEXT_PUBLIC_API_MODE=mock`).

| # | Necesidad | Propuesta | Respuesta | Historias |
|---|---|---|---|---|
| 1 | Saldo | RPC `obtener_saldo()` (security definer, solo el usuario actual) | `{ saldo int, por_vencer_cantidad int?, por_vencer_at timestamptz?, email_verificado bool }` | CR-01, NR-04, NR-07 |
| 2 | Costos por extensión | Tabla/vista `costos_extension` (lectura pública) | `[{ extension, max_creditos, min_creditos }]` — machete 2/1, corto 4/2, medio 8/4, completo 16/8 | NR-04 |
| 3 | Crear resumen + reservar | RPC `crear_resumen(p_apuntes, p_instrucciones, p_tipo, p_extension, p_diseno, p_opciones jsonb, p_idempotency_key uuid)` — crea `resumenes` (`en_cola`) + `reserva −máx` en 1 transacción; valida 300–40.000 / 1.000 chars, email verificado, saldo; idempotente por key | OK: `{ resumen_id, creditos_reservados, saldo }`. Error: `raise exception` con mensaje exacto `saldo_insuficiente` \| `email_no_verificado` \| `limite_activos` \| `validacion` | NR-01, NR-06, NR-07 |
| 4 | Estado del job | `select` en `resumenes` (RLS dueño): `id, estado, progreso 0-100, tipo, extension, opciones, creditos_reservados, creditos_cobrados, paginas` + Realtime habilitado en la tabla | estados: `en_cola \| generando \| armando \| listo \| error` | GE-03 |
| 5 | Descarga | RPC/Edge Function `url_descarga_resumen(p_resumen_id)` → signed URL 5 min de `resumenes/{user_id}/{id}.pdf` | `text` (URL) | GE-03, BI-02 |
| 6 | Perfil | `select` en `perfiles` (nombre, último uso de colores/diseño) + materias previas para autocompletar | — | NR-06 |
| 7 | Registro T&C | Trigger sobre `auth.users` que lea `raw_user_meta_data.acepto_terminos / version_terminos` y complete `perfiles.acepto_terminos_at / version_terminos` | — | CU-01 |
| 8 | Auth config | Site URL + Redirect URLs: `{SITE_URL}/auth/callback`; plantillas de email (confirm / recovery) que apunten a `/auth/callback?token_hash={{ .TokenHash }}&type=...`; Google OAuth habilitado; captcha (si se activa, el front necesita la site key) | — | CU-01..04, CU-07 |
| 9 | Semana 3 | Historial agrupado por resumen (vista `movimientos_agrupados`), crear preferencia MP (`crear_pago(pack)` → `init_point`), listado biblioteca, reportar error | — | CR-03, CR-05, BI-01..03 |

Decisiones abiertas que afectan la UI: PA-07 (redondeo del mínimo), PA-08 (Machete de 1 hoja fuerza extensión — hoy la UI lo fuerza), PA-13.
