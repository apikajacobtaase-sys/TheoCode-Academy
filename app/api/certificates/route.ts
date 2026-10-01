import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);

    const certificates = await sql`
      SELECT 
        c.id,
        c.certificate_number,
        c.issued_at,
        co.title as course_title,
        co.description as course_description
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      WHERE c.user_id = ${userId}
      ORDER BY c.issued_at DESC
    `;

    return NextResponse.json({ certificates });

  } catch (error: any) {
    console.error('❌ Certificates GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}