import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Macheteo · Tus apuntes, hechos machete",
  description: "Pegá tus apuntes y llevate un PDF A4 que parece escrito a mano en tu cuaderno.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${inter.variable} ${caveat.variable} min-h-screen bg-slate-50 font-sans text-slate-900 antialiased`}>{children}</body>
    </html>
  );
}
