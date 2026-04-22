import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const pathname = request.nextUrl.pathname;

  // ✅ PUBLIC ROUTE — allow anyone
  if (pathname.startsWith("/peerfeedback")) {
    return NextResponse.next();
  }

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgetpassword") ||
    pathname.startsWith("/emailverification") ||
    pathname.startsWith("/resetpassword") ||
    pathname.startsWith("/newpassword");

  const isProtectedRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/presentationwizard") ||
    pathname.startsWith("/feedback") ||
    pathname.startsWith("/presentation");

  // 🚫 Not logged in → block protected routes
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      request.nextUrl.pathname + request.nextUrl.search
    );

    return NextResponse.redirect(loginUrl);
  }

  // ✅ Logged in → prevent visiting login/register pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}
