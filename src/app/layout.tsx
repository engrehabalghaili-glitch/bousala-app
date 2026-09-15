import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "بوصلة — رتّب أهدافك، تخلّص من الشتات، وابدأ",
  description:
    "نظام هادئ لإدارة الأهداف والحياة: صفِّ شتات ذهنك، اختر 3 أهداف فقط، وتقدّم بلا مواعيد ضاغطة أو عدادات مرهقة. يعمل دون اتصال وبياناتك محفوظة محليًا.",
  keywords: ["أهداف", "إنتاجية هادئة", "بوصلة", "تخطيط الحياة", "الهدوء الذهني"],
  manifest: "/manifest.webmanifest",
  applicationName: "بوصلة",
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
