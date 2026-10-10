import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (4 MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4 MB.' },
        { status: 400 }
      );
    }

    // Convert to base64 data URL (simple storage; for production, use Cloudinary/S3)
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO profiles (user_id, avatar_url, updated_at)
      VALUES (${user.id}, ${dataUrl}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET avatar_url = ${dataUrl}, updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar_url: dataUrl,
    });
  } catch (error: any) {
    console.error('❌ Upload Avatar Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar', details: error.message },
      { status: 500 }
    );
  }
}