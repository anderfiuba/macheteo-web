import type { Metadata } from "next";
import { Instrument_Sans, Young_Serif } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { ToastProvider } from "@/components/Toast";
import { PRODUCTION_URL } from "@/lib/config";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });
const young = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young" });

const DESCRIPCION = "Pegá tu guía, elegí cuántas hojas querés y en unos minutos tenés tu machete en PDF. Gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: "Macheteo · Estudiá lo que te van a tomar",
  description: DESCRIPCION,
  openGraph: {
    type: "website",
    url: PRODUCTION_URL,
    siteName: "Macheteo",
    locale: "es_AR",
    title: "Macheteo · Estudiá lo que te van a tomar",
    description: DESCRIPCION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${instrument.variable} ${young.variable} flex min-h-screen flex-col bg-hoja font-sans text-noche antialiased`}>
        <ToastProvider>
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
