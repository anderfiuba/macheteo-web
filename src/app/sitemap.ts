import type { MetadataRoute } from "next";
import { PRODUCTION_URL, RUTAS_PUBLICAS } from "@/lib/config";

/** Solo páginas públicas (la app logueada no se indexa). La landing se suma cuando exista. */
export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_PUBLICAS.map((ruta) => ({
    url: `${PRODUCTION_URL}${ruta}`,
    changeFrequency: "monthly",
    priority: ruta === "/registro" ? 0.8 : 0.3,
  }));
}
