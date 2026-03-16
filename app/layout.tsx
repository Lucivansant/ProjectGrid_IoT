import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Força o runtime edge para compatibilidade com Cloudflare Pages (Removido por incompatibilidade com Node.js/SQLite/MQTT)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectGrid - Plataforma IoT as a Service",
  description:
    "Seu dashboard IoT as a Service. Conecte seu ESP32 e projetos IoT através de Brokers MQTT e WebSockets de maneira unificada e em tempo real.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
