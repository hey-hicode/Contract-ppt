// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/dashboard",
  "/sign-in(.*)",
  "/sign-up(.*)",

  // ✅ IMPORTANT: allow Stripe webhook
  "/api/stripe/webhook(.*)",

  // other public APIs
  "/api/parse-data(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth();

  if (!userId) {
    const url = req.nextUrl.clone();
    const isApi =
      url.pathname.startsWith("/api") || url.pathname.startsWith("/trpc");

    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    url.pathname = "/";
    url.searchParams.set("unauth", "1");
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
