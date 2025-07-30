// src/middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server';

/**
 * Clerk middleware grants access to user authentication state throughout your app.
 * It should run for most routes except for static assets.
 */
export default clerkMiddleware();

/**
 * Configure which paths the middleware applies to.
 * The matcher here is similar to the default used in Clerk’s docs.
 */
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|wof?f2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
