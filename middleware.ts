import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get("refresh");

  if (!isLoggedIn && req.nextUrl.pathname.startsWith("/workouts")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
