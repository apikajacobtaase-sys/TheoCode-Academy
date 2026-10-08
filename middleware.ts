import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/explore(.*)',
  '/courses(.*)',
  '/about(.*)',
  '/challenges(.*)',
  '/leaderboard(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',

  // Public API routes
  '/api/courses(.*)',
  '/api/challenges(.*)',
  '/api/search(.*)',
  '/api/leaderboard(.*)',
  '/api/certificates(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing(.*)',
]);

export default clerkMiddleware(
  async (auth, request) => {
    // Protect everything that isn't explicitly public
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    // Enable Clerk's frontend API proxy
    frontendApiProxy: {
      enabled: true,
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)',

    // Always run for API routes
    '/(api|trpc)(.*)',

    // Always run for Clerk frontend API routes
    '/__clerk/(.*)',
  ],
};