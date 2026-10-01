const fs = require('fs');

function fixFile(path, replacer) {
  if (!fs.existsSync(path)) return console.log(`⚠️ Skipped ${path} (not found)`);
  let content = fs.readFileSync(path, 'utf8');
  const original = content;
  content = replacer(content);
  if (content !== original) {
    fs.writeFileSync(path, content);
    console.log(`✅ Fixed: ${path}`);
  } else {
    console.log(`⏭️ Already clean: ${path}`);
  }
}

// 1. lib/uploadthing.ts
fixFile('lib/uploadthing.ts', () => `import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { ourFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<typeof ourFileRouter>();
export const UploadDropzone = generateUploadDropzone<typeof ourFileRouter>();
`);

// 2. lib/erifyAdmin.ts
fixFile('lib/erifyAdmin.ts', () => `import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function verifyAdmin() {
  const { userId } = await auth();
  if (!userId) return { isAdmin: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const user = await currentUser();
  if (!user || user.publicMetadata?.isAdmin !== true) return { isAdmin: false, error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) };
  return { isAdmin: true, userId };
}
`);

// 3. components/SmartNavigation.tsx
fixFile('components/SmartNavigation.tsx', (c) => c.replace(/<UserButton[^>]*signOutOptions[^>]*\/>/g, '<UserButton />'));

// 4. app/admin/layout.tsx
fixFile('app/admin/layout.tsx', (c) => c.replace(/<UserButton[^>]*afterSignOutUrl[^>]*\/>/g, '<UserButton />'));

// 5. app/courses/page.tsx
fixFile('app/courses/page.tsx', (c) => c.replace(/useState\(new Set\(\)\)/g, 'useState<Set<string>>(new Set<string>())').replace(/new Set\(\(/g, 'new Set<string>('));

// 6. app/api/squad/route.ts (Removes the broken params argument)
fixFile('app/api/squad/route.ts', (c) => c.replace(/,\s*\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*squadId:\s*string;\s*\}>\s*\}/g, ''));

// 7. app/courses/students/route.ts (Removes the broken params argument)
fixFile('app/courses/students/route.ts', (c) => c.replace(/,\s*\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*id:\s*string;\s*\}>\s*\}/g, ''));

// 8. app/api/user/profile/route.ts (Removes imageUrl)
fixFile('app/api/user/profile/route.ts', (c) => c.replace(/imageUrl:\s*[^,]+,?\n?/g, ''));

// 9. app/api/squads/join/route.ts (Fixes Clerk client)
fixFile('app/api/squads/join/route.ts', (c) => {
  return c.replace(/const\s*\{\s*getUser\s*\}\s*=\s*await\s*import\('@clerk\/nextjs\/server'\);/g, "const { clerkClient } = await import('@clerk/nextjs/server');")
          .replace(/const\s*clerkUser\s*=\s*await\s*getUser\(userId\);/g, "const client = await clerkClient();\n      const clerkUser = await client.users.getUser(userId);");
});

console.log("\n🎉 SCRIPT COMPLETE! Now run these 3 commands:");
console.log("git add .");
console.log('git commit -m "Force fix all TS errors via script"');
console.log("git push origin main");