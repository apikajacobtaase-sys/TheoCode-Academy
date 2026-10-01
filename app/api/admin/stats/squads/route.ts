import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL!);
    
    const squadsResult = await sql`SELECT COUNT(*) as count FROM squads`;
    const messagesResult = await sql`SELECT COUNT(*) as count FROM squad_messages`;

    return NextResponse.json({
      count: parseInt(squadsResult[0].count),
      messages: parseInt(messagesResult[0].count)
    });
  } catch (error: any) {
    console.error('❌ Stats Squads Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}