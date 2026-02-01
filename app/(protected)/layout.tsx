"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    // Show loading spinner while AuthProvider initializes
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // If user exists, render the protected page content
  return <>{children}</>;
}
