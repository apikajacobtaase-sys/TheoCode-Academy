import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      SELECT * FROM challenges WHERE id = ${id} LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ challenge: result[0] });
  } catch (error: any) {
    console.error('❌ Admin Challenge API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE challenges
      SET 
        title = ${data.title},
        description = ${data.description || ''},
        difficulty = ${data.difficulty},
        category = ${data.category || ''},
        language = ${data.language || 'javascript'},
        prompt = ${data.prompt || ''},
        starter_code = ${data.starter_code || ''},
        expected_output = ${data.expected_output || ''},
        hints = ${data.hints || ''},
        points = ${data.points || 10},
        sample_test_cases = ${JSON.stringify(data.sample_test_cases || [])}::jsonb,
        hidden_test_cases = ${JSON.stringify(data.hidden_test_cases || [])}::jsonb
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin Update Challenge Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM challenges WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin Delete Challenge Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}