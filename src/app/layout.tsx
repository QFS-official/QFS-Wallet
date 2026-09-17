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
  title: "QFS Wallet | Your financial world, in a single wallet",
  description:
    "QFS Wallet — Non-custodial, multi-chain crypto wallet. Manage, send and receive your digital assets securely, quickly and without borders. Part of the Quantum Financial System.",
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
    <html lang="en" suppressHydrationWarning className="dark">
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
