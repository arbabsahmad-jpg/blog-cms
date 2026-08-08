import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase auth session cookie fresh, and blocks unauthenticated
 * visitors from everything under /admin except the login page itself.
 * (Intentionally does NOT redirect logged-in users away from /admin/login —
 * that convenience redirect is what caused a loop; the login page handles
 * that case client-side instead.)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") && path !== "/admin/login";

  if (isAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}