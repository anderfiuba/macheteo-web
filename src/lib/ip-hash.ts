import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";

/** Prefijo de IP (N-04): IPv4 /32 completo · IPv6 /64 (primeros 4 grupos, expandidos). */
export function prefijoIp(ip: string): string | null {
  const limpia = ip.trim().replace(/^\[|\]$/g, "").split("%")[0];
  const v = isIP(limpia);
  if (v === 4) return limpia;
  if (v === 6) {
    if (limpia.toLowerCase().startsWith("::ffff:") && isIP(limpia.slice(7)) === 4) return limpia.slice(7);
    const [cab, cola = ""] = limpia.toLowerCase().split("::");
    const a = cab ? cab.split(":") : [];
    const b = cola ? cola.split(":") : [];
    const grupos = limpia.includes("::") ? [...a, ...Array(8 - a.length - b.length).fill("0"), ...b] : a;
    return grupos.slice(0, 4).map((g) => g.padStart(4, "0")).join(":") + "::/64";
  }
  return null;
}

/**
 * p_ip_hashes (N-04 / N-18): [HMAC(IP_HASH_SECRET, prefijo), HMAC(IP_HASH_SECRET_ANTERIOR, prefijo)?].
 * La 2.ª clave solo se configura durante las 24 h de solapamiento tras rotar. Sin x-real-ip → [] (bucket "desconocido", fail-closed).
 */
export function ipHashes(xRealIp: string | null): string[] {
  const secreto = process.env.IP_HASH_SECRET;
  const anterior = process.env.IP_HASH_SECRET_ANTERIOR;
  const prefijo = xRealIp ? prefijoIp(xRealIp) : null;
  if (!prefijo || !secreto) return [];
  const h = (k: string) => createHmac("sha256", k).update(prefijo).digest("hex");
  return anterior ? [h(secreto), h(anterior)] : [h(secreto)];
}
