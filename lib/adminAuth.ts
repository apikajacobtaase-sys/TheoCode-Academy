import { auth } from '@clerk/nextjs/server';

// 🎯 List of admin user IDs (add your Clerk user ID here)
const ADMIN_USER_IDS = [
  'user_3Jf5At9jzJzOfTnaBsUNIXCAUx4', // Your user ID
  // Add more admin IDs here
];

export async function requireAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  if (!ADMIN_USER_IDS.includes(userId)) {
    throw new Error('Forbidden: Admin access required');
  }
  
  return userId;
}