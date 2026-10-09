import type { MetadataRoute } from "next";
import { PRODUCTION_URL } from "@/lib/config";

/** Producción: indexa lo público. Previews/staging (VERCEL_ENV ≠ production) y local: no indexar nada. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/nuevo", "/biblioteca", "/perfil", "/resumenes/", "/recuperar", "/verificar", "/bienvenida"],
    },
    sitemap: `${PRODUCTION_URL}/sitemap.xml`,
    host: PRODUCTION_URL,
  };
}
