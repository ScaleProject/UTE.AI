import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UTE.AI Dashboard — SKY Intelligence",
  description: "Sistema de admisiones con IA — Universidad Tecnológica Equinoccial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
