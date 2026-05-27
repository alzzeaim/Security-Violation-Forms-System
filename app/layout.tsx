import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
});

export const metadata: Metadata = {
  title: "🚨 نظام إدخال المخالفات الأمنية - القدية",
  description: "نظام إلكتروني داخلي لإدخال وتصدير نماذج المخالفات الأمنية لمشروع القدية بتصميم معاصر وأداء فائق.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <body
        className={`${ibmPlexArabic.variable} font-sans antialiased min-h-full bg-[#F8F9FA] text-[#111827]`}
      >
        {children}
      </body>
    </html>
  );
}
