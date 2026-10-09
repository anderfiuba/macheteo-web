import type { Metadata } from "next";
import { Instrument_Sans, Young_Serif } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });
const young = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young" });

export const metadata: Metadata = {
  title: "Macheteo · Estudiá lo que te van a tomar",
  description: "Pegá tu guía, elegí cuántas hojas querés y en unos minutos tenés tu machete en PDF. Gratis.",
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
