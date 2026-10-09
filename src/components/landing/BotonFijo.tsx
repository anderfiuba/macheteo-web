"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Mobile: botón fijo "Armar mi machete" al pasar el hero (L01 #5). Se oculta sobre el CTA final. */
export function BotonFijo() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const cta = document.getElementById("cta-final");
    if (!hero || !cta) return;
    const vis = { hero: true, cta: false };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) vis[e.target.id === "hero" ? "hero" : "cta"] = e.isIntersecting;
      setVer(!vis.hero && !vis.cta);
    });
    io.observe(hero);
    io.observe(cta);
    return () => io.disconnect();
  }, []);
  if (!ver) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-1.5 border-t border-borde bg-white px-5 pb-2.5 pt-3 text-center lg:hidden">
      <Link href="/registro" className="rounded-md bg-birome py-3 font-semibold text-white">Armar mi machete</Link>
      <span className="text-xs text-gastado">Gratis, sin tarjeta</span>
    </div>
  );
}
