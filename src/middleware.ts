// middleware.ts (or src/middleware.ts)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes (keep "/" and anything else you want unauthenticated)
const isPublicRoute = createRouteMatcher([
  "/", // homepage stays public
  "/dashboard", // allow parsing workflow without auth
  "/sign-in(.*)", // Clerk sign-in pages
  "/sign-up(.*)", // Clerk sign-up pages
  "/api/parse-data(.*)", // parsing endpoint must be public for pre-auth uploads
  // "/api/webhooks(.*)", // example: allow your webhooks
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth();

  if (!userId) {
    const url = req.nextUrl.clone();
    const isApi =
      url.pathname.startsWith("/api") || url.pathname.startsWith("/trpc");

    if (isApi) {
      // For fetch/XHR: return JSON 401 instead of redirecting to "/"
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For page navigations: redirect to homepage
    url.pathname = "/";
    // Optional: flag why we redirected (useful for a toast)
    url.searchParams.set("unauth", "1");
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Run on everything except static files and _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    // And ensure API routes are included
    "/(api|trpc)(.*)",
  ],
};
