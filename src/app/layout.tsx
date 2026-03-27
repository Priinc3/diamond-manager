import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Diamond Manager — Business Transactions & Stock",
  description: "Manage your diamond business transactions, track money owed, and monitor diamond stock across contacts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#111827',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
