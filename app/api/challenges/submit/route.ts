import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { challengeId, code, languageId } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Fetch challenge and its test cases
    const challengeData = await sql`
      SELECT id, title, points, public_test_cases, private_test_cases 
      FROM challenges WHERE id = ${challengeId}
    `;

    if (challengeData.length === 0) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const challenge = challengeData[0];
    const allTestCases = [
      ...(challenge.public_test_cases || []),
      ...(challenge.private_test_cases || [])
    ];

    if (allTestCases.length === 0) {
      return NextResponse.json({ error: 'No test cases found for this challenge' }, { status: 400 });
    }

    // 2. Execute against ALL test cases
    const API_URL = process.env.ONLINE_COMPILER_API_URL || 'https://api.onlinecompiler.com/v1/execute';
    const API_KEY = process.env.ONLINE_COMPILER_API_KEY;
    
    let passedCount = 0;
    const publicResults = [];
    let compilationError = null;
    let runtimeError = null;

    for (const tc of allTestCases) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: tc.input || '',
        }),
      });

      const result = await response.json();

      if (result.status !== 'success' || result.compile_output) {
        compilationError = result.compile_output || result.stderr;
        break; // Stop grading on compilation error
      }

      if (result.stderr) {
        runtimeError = result.stderr;
        break; // Stop grading on runtime error
      }

      // Simple string comparison for output (trim whitespace for fairness)
      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = (tc.expected_output || '').trim();
      const isPassed = actualOutput === expectedOutput;

      if (isPassed) passedCount++;

      // Only expose public test case results to the frontend
      if (tc.is_public) {
        publicResults.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: actualOutput,
          passed: isPassed
        });
      }
    }

    const totalCases = allTestCases.length;
    const isAccepted = passedCount === totalCases && !compilationError && !runtimeError;

    // 3. Update Database ONLY if Accepted
    let earnedPoints = 0;
    if (isAccepted) {
      earnedPoints = challenge.points;
      
      // Record submission
      await sql`
        INSERT INTO challenge_submissions (user_id, challenge_id, code, status, earned_points, submitted_at)
        VALUES (${userId}, ${challengeId}, ${code}, 'accepted', ${earnedPoints}, NOW())
        ON CONFLICT (user_id, challenge_id) 
        DO UPDATE SET status = 'accepted', earned_points = ${earnedPoints}, submitted_at = NOW()
      `;

      // Update progress
      await sql`
        INSERT INTO challenge_progress (user_id, challenge_id, status, solved_at)
        VALUES (${userId}, ${challengeId}, 'solved', NOW())
        ON CONFLICT (user_id, challenge_id) 
        DO UPDATE SET status = 'solved', solved_at = NOW()
      `;
    } else {
      // Record failed attempt
      await sql`
        INSERT INTO challenge_submissions (user_id, challenge_id, code, status, earned_points, submitted_at)
        VALUES (${userId}, ${challengeId}, ${code}, ${compilationError ? 'compilation_error' : runtimeError ? 'runtime_error' : 'wrong_answer'}, 0, NOW())
      `;
    }

    // 4. Return secure grading results
    return NextResponse.json({
      status: isAccepted ? 'accepted' : (compilationError ? 'compilation_error' : runtimeError ? 'runtime_error' : 'wrong_answer'),
      score: Math.round((passedCount / totalCases) * 100),
      earnedPoints: isAccepted ? earnedPoints : 0,
      compilationError,
      runtimeError,
      publicResults,
    });

  } catch (error: any) {
    console.error('Submit API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}