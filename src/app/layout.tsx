import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "أثر أكاديمي | أثر في كل خطوة",
  description: "منصة أثر أكاديمي لطلاب الصف الثالث الثانوي في مصر."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
