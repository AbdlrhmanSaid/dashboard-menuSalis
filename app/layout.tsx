import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "منيو سَلِس",
  description: "لوحة تحكم منصة منيو سَلِس",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.variable} font-sans antialiased bg-slate-50 text-slate-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
