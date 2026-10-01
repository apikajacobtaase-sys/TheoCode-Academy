import { useUser } from '@clerk/nextjs';

export function useIsAdmin() {
  const { user, isLoaded } = useUser();
  
  // 1. Check Clerk Public Metadata
  const hasMetadata = user?.publicMetadata?.isAdmin === true;
  
  // 2. FALLBACK: Check your specific email address
  // ⚠️ REPLACE THIS WITH YOUR ACTUAL EMAIL ADDRESS!
  const isAdminEmail = user?.primaryEmailAddress?.emailAddress === 'apikajacobtaase@gmail.com';

  // You are an admin if EITHER condition is true
  const isAdmin = hasMetadata || isAdminEmail;
  
  return { isAdmin, isLoaded };
}