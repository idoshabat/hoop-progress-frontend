import "./globals.css";
import { AuthProvider } from "./Context/AuthContext";
import { SuccessFeedbackProvider } from "./Context/SuccessFeedbackContext";
import Navbar from "./Components/Navbar";
import { NotificationProvider } from "./hooks/useNotifications";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/HoopProgressLogo.png",
    shortcut: "/HoopProgressLogo.png",
    apple: "/HoopProgressLogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-stone-100">
        <AuthProvider>
          <SuccessFeedbackProvider>
            <NotificationProvider>
              <Navbar />
              {children}
            </NotificationProvider>
          </SuccessFeedbackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
