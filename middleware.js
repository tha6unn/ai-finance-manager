// middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import arcjet, { createMiddleware, detectBot, shield } from '@arcjet/next';
import { NextResponse } from 'next/server';

// Setup Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', 'GO_HTTP'],
    }),
  ],
});

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/account(.*)',
  '/transaction(.*)',
]);

// Combine Clerk and Arcjet middleware
export default createMiddleware(
  aj,
  clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth().protect();
    }
    return NextResponse.next();
  })
);

// Middleware matcher configuration
export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // Exclude static files and Next.js internals
    '/(api|trpc)(.*)',        // Include API routes
  ],
};
