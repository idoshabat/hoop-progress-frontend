import "./globals.css";
import { AuthProvider } from "./Context/AuthContext";
import { LanguageProvider } from "./Context/LanguageContext";
import { SuccessFeedbackProvider } from "./Context/SuccessFeedbackContext";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
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
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-zinc-950 text-stone-100">
        <LanguageProvider>
          <AuthProvider>
            <SuccessFeedbackProvider>
              <NotificationProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </NotificationProvider>
            </SuccessFeedbackProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
