import type { Metadata } from "next";
import { APP_NAME } from "@/config/constants";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Plan your weeks. Achieve your goals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){["bis_skin_checked","bis_register"].forEach(function(a){document.querySelectorAll("["+a+"]").forEach(function(e){e.removeAttribute(a)})})})()`,
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
