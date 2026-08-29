import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QFS Wallet | Quantum Financial System",
  description:
    "QFS Wallet - Your gateway to the Quantum Financial System. Non-custodial, multi-chain crypto wallet with built-in DeFi features.",
  keywords: [
    "QFS",
    "Wallet",
    "Crypto",
    "Blockchain",
    "DeFi",
    "Quantum Financial System",
    "Non-custodial",
    "Multi-chain",
  ],
  authors: [{ name: "QFS Official" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "551x535", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var d=localStorage.getItem('settings_darkMode');
            if(d===null||d==='true'){document.documentElement.classList.add('dark');}
          })();
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
