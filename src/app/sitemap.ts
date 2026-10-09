import type { MetadataRoute } from "next";
import { PRODUCTION_URL, RUTAS_PUBLICAS } from "@/lib/config";

/** Solo páginas públicas (la app logueada no se indexa). */
export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_PUBLICAS.map((ruta) => ({
    url: `${PRODUCTION_URL}${ruta}`,
    changeFrequency: "monthly",
    priority: ruta === "/" ? 1 : ruta === "/registro" ? 0.8 : 0.3,
  }));
}
