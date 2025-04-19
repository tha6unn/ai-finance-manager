import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Setup Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Setup Clerk middleware
const clerk = clerkMiddleware();

export default createMiddleware(
  aj,
  clerk,
  async (req) => {
    // Auth check for protected routes
    const url = req.nextUrl.pathname;
    const protectedRoutes = ["/dashboard", "/account", "/transaction"];
    if (protectedRoutes.some((route) => url.startsWith(route))) {
      const { auth, redirectToSignIn } = await import("@clerk/nextjs/server");
      const { userId } = await auth();

      if (!userId) return redirectToSignIn();
    }

    return NextResponse.next();
  }
);

// Clerk & Arcjet will work for these routes
export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // All routes except static files and internals
    "/(api|trpc)(.*)", // Include API
  ],
};
