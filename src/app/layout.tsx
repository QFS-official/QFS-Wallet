import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QFS Wallet | Tu mundo cripto, en tus manos",
  description:
    "QFS Wallet — Billetera no-custodial, multi-cadena, con staking, swaps y acceso al Quantum Financial System. Seguro · Rápido · Global.",
  keywords: [
    "QFS",
    "Wallet",
    "Crypto",
    "Blockchain",
    "DeFi",
    "Quantum Financial System",
    "Non-custodial",
    "Multi-chain",
    "Staking",
    "Swap",
  ],
  authors: [{ name: "QFS Official" }],
  icons: {
    icon: [
      { url: "/qfs-app-logo-64.png", sizes: "64x64", type: "image/png" },
      { url: "/qfs-app-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/qfs-app-logo-256.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            document.documentElement.classList.add('dark');
          })();
        ` }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
