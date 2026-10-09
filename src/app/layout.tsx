import type { Metadata } from "next";
import { Inter, Kalam } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam" });

export const metadata: Metadata = {
  title: "Macheteo · Tus apuntes, hechos machete",
  description: "Pegá tus apuntes y llevate un PDF A4 que parece escrito a mano en tu cuaderno.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${inter.variable} ${kalam.variable} flex min-h-screen flex-col bg-paper font-sans text-ink antialiased`}>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
