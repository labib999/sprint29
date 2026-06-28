import type { Metadata } from "next";
import { APP_NAME } from "@/config/constants";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Plan your weeks. Achieve your goals.",
};

/**
 * Root layout. Wraps every page with the AuthProvider so auth state
 * is available application-wide. The AuthProvider is a client component
 * that provides the useAuth hook to all children.
 *
 * Children can be server components — Next.js passes them as props
 * through the client boundary seamlessly.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
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
