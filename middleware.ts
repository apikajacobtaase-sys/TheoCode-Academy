import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that DO NOT require login (public routes)
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
  '/api/courses(.*)', // ✅ This allows all course APIs including lessons
  '/api/challenges(.*)',
  '/api/search(.*)',
  '/api/leaderboard(.*)',
  '/api/certificates(.*)',
  '/api/webhooks(.*)',
  '/api/uploadthing(.*)'
]);
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};