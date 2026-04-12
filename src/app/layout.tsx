import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

// Scroll To Top Button
import ScrollToTop from "./ScrollToTop";

// ตั้งค่าฟอนต์
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

// ตั้งค่า Metadata (SEO)
export const metadata: Metadata = {
  title: "Waiyawat Aphiraktanon - Portfolio",
  description: "Bridging Business Strategy with Technology.",
};

// RootLayout ตัวเดียวที่รวมทั้ง children, modal และ ScrollToTop
export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {/* เนื้อหาหลักของหน้าเว็บ */}
        {children}
        
        {/* ระบบ Pop-up Modal (Parallel Routes) */}
        {modal}
        
        {/* ปุ่มเลื่อนขึ้นบนสุด */}
        <ScrollToTop />
      </body>
    </html>
  );
}