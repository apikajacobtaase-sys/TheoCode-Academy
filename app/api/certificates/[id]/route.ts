import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: certId } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const certificate = await sql`
      SELECT 
        c.*,
        c.course_id,
        c.user_id,
        c.certificate_number,
        c.issued_at,
        up.full_name,
        up.username,
        up.profile_image_url,
        co.title as course_title,
        co.description as course_description
      FROM certificates c
      JOIN user_profiles up ON c.user_id = up.user_id
      JOIN courses co ON c.course_id = co.id
      WHERE c.id = ${certId}
    `;

    if (certificate.length === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ certificate: certificate[0] });

  } catch (error: any) {
    console.error('❌ Certificate GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}