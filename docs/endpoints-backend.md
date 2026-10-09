# Macheteo — Contrato Frontend ↔ Backend (propuesta, a confirmar)

Todo vía Supabase (PostgREST/RPC con JWT del usuario + RLS). Nombres propuestos; el front los consume desde `src/lib/api/supabase.ts`
(interfaz `MacheteoApi` en `src/lib/api/types.ts`). Hoy corre con `mockApi` (`NEXT_PUBLIC_API_MODE=mock`).

| # | Necesidad | Propuesta | Respuesta | Historias |
|---|---|---|---|---|
| 1 | Saldo | RPC `obtener_saldo()` (security definer, solo el usuario actual) | `{ saldo int (disponible, reservas ya descontadas), reservados int (reservas de resúmenes en curso), por_vencer_cantidad int?, por_vencer_at timestamptz?, email_verificado bool }` | CR-01, NR-04, NR-07 |
| 2 | Costos por extensión | Tabla/vista `costos_extension` (lectura pública) | `[{ extension, max_creditos, min_creditos }]` — machete 2/1, corto 4/2, medio 8/4, completo 16/8 | NR-04 |
| 3 | Crear resumen + reservar | RPC `crear_resumen(p_apuntes, p_instrucciones, p_tipo, p_extension, p_diseno, p_opciones jsonb, p_idempotency_key uuid)` — crea `resumenes` (`en_cola`) + `reserva −máx` en 1 transacción; valida 300–40.000 / 1.000 chars, email verificado, saldo; idempotente por key | OK: `{ resumen_id, creditos_reservados, saldo }`. Error: `raise exception` con mensaje exacto `saldo_insuficiente` \| `email_no_verificado` \| `limite_activos` \| `validacion` | NR-01, NR-06, NR-07 |
| 4 | Estado del job | `select` en `resumenes` (RLS dueño): `id, estado, progreso 0-100, tipo, extension, opciones, creditos_reservados, creditos_cobrados, paginas, error_codigo` (+ opcional `posicion_cola` para "Hay N antes que vos") + Realtime habilitado en la tabla | estados: `en_cola \| generando \| armando \| listo \| error` | GE-03 |
| 5 | Descarga | RPC/Edge Function `url_descarga_resumen(p_resumen_id)` → signed URL 5 min de `resumenes/{user_id}/{id}.pdf` | `text` (URL) | GE-03, BI-02 |
| 6 | Perfil | `select` en `perfiles` (nombre, último uso de colores/diseño) + materias previas para autocompletar | — | NR-06 |
| 7 | Registro T&C | Trigger sobre `auth.users` que lea `raw_user_meta_data.acepto_terminos / version_terminos` y complete `perfiles.acepto_terminos_at / version_terminos` | — | CU-01 |
| 8 | Auth config | Site URL + Redirect URLs: `{SITE_URL}/auth/callback`; plantillas de email (confirm / recovery) que apunten a `/auth/callback?token_hash={{ .TokenHash }}&type=...`; Google OAuth habilitado; captcha (si se activa, el front necesita la site key) | — | CU-01..04, CU-07 |
| 9 | Semana 3 | Historial agrupado por resumen (vista `movimientos_agrupados`), crear preferencia MP (`crear_pago(pack)` → `init_point`), listado biblioteca, reportar error | — | CR-03, CR-05, BI-01..03 |

Decisiones: PA-07 y PA-08 **aprobadas** como están implementadas (mínimo = ceil(máx/2); "Machete de 1 hoja" = 1 hoja A4 anverso y reverso = 2 págs, fuerza extensión Machete, costo hasta 2 créditos, mín. 1). Abierta: PA-13.

Rutas de redirect a configurar en Supabase Auth: `/auth/callback` (param `volver=`). Errores de link → `/verificar?estado=vencido` o `/recuperar?estado=vencido`; recovery OK → `/recuperar/nueva`.

---

## 10. Botón de arrepentimiento (Res. SCI 424/2020) · P0 · propuesta

Formulario público `/arrepentimiento` (sin login, link en el footer de todas las páginas). Procesamiento **manual**.

**Tabla `solicitudes_arrepentimiento`**

| columna | tipo | notas |
|---|---|---|
| `id` | uuid PK default `gen_random_uuid()` | |
| `numero` | text UNIQUE NOT NULL | legible, ej. `ARR-2026-000123` (secuencia `solicitudes_arrepentimiento_seq`, con padding) |
| `email` | text NOT NULL | normalizado a minúsculas |
| `referencia_pago` | text NOT NULL | lo que escribe el usuario (nro. de operación MP o `external_reference`) |
| `motivo` | text NULL | opcional, máx. 1.000 (la norma no exige justificar) |
| `user_id` | uuid NULL → `auth.users` | si hay sesión, `auth.uid()` |
| `pago_id` | uuid NULL → `pagos` | match automático si `referencia_pago` = `pagos.mp_payment_id` o `pagos.id` y el email coincide; si no, lo completa el equipo |
| `estado` | text NOT NULL default `'recibida'` | `recibida \| en_revision \| aprobada \| rechazada` (actualiza solo el equipo) |
| `ip` | inet NULL | para rate limit/auditoría |
| `created_at` / `resuelta_at` | timestamptz | |

RLS: sin `select/update/delete` para `anon`/`authenticated`; sin insert directo. Solo vía la RPC.

**RPC `crear_solicitud_arrepentimiento(p_email text, p_referencia_pago text, p_motivo text default null)`** — `security definer`, `grant execute to anon, authenticated`.
- Valida: email con formato válido, `referencia_pago` 3–100 caracteres, `motivo` ≤ 1.000 → si no, `raise exception 'validacion'`.
- Rate limit: máx. 5 por IP/hora y 3 por email/día → `raise exception 'rate_limit'`.
- Inserta y devuelve `{ numero text, created_at timestamptz }`. El front muestra el número ("Guardalo").
- Efectos (Backend): email de acuse a usuario y equipo vía Resend con el número (la norma pide informar el código dentro de las 24 h), y alerta interna.
- Reversión de créditos/reembolso MP: manual (admin), con movimiento negativo en el ledger si corresponde; ver PA-11.

Front: `MacheteoApi.solicitarArrepentimiento({ email, referenciaPago, motivo? })` → `{ ok: true, numero, creadaAt } | { ok: false, error: 'validacion' | 'rate_limit' | 'desconocido' }` (mock en `src/lib/api/mock.ts`, real en `src/lib/api/supabase.ts`).
