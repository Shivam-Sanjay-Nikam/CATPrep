import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Academic Sanctuary | Master the CAT with Precision",
  description: "Elite resources and focused digital environments for serious CAT aspirants. Master your preparation with precision analytics and curated curriculum.",
  keywords: ["CAT preparation", "MBA entrance", "Aptitude training", "Academic Sanctuary", "Mock CAT"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-inter)" }} suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{ __html: `
          h1, h2, h3, h4, h5, h6 { font-family: var(--font-manrope); }
        `}} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
