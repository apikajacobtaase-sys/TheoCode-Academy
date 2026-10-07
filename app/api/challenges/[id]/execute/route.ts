import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// 🛡️ Securely execute code on OnlineCompiler.io with FULL DEBUGGING
async function executeCode(code: string, input: string, language: string) {
  // 🎯 EXACT compiler names from OnlineCompiler.io documentation
  const compilerMap: Record<string, string> = {
    'C++': 'g++-15',
    'Python': 'python-3.14',
    'Java': 'openjdk-25',
    'JavaScript': 'node-20'
  };

  const compiler = compilerMap[language] || 'g++-15'; // Default to C++
  const apiKey = process.env.ONLINE_COMPILER_API_KEY;

  console.log('🔍 ATTEMPTING EXECUTION:', { 
    compiler, 
    hasApiKey: !!apiKey, 
    apiKeyStart: apiKey ? apiKey.substring(0, 8) + '...' : 'NONE' 
  });

  const res = await fetch('https://api.onlinecompiler.io/api/run-code-sync/', {
    method: 'POST',
    headers: {
      'Authorization': apiKey || '', 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      compiler: compiler,
      code,
      input: input || ''
    })
  });

  console.log('📦 ONLINECOMPILER STATUS:', res.status);
  
  // Safely parse response (it might be JSON or HTML error page)
  let responseData;
  try {
    responseData = await res.json();
  } catch {
    responseData = await res.text();
  }
  
  console.log('📦 ONLINECOMPILER RESPONSE:', responseData);

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${JSON.stringify(responseData)}`);
  }
  
  return {
    stdout: responseData.stdout || responseData.output || '',
    stderr: responseData.stderr || '',
    error: responseData.error || null
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { code, mode } = await request.json(); // mode: 'run' or 'submit'

    const sql = neon(process.env.DATABASE_URL!);
    const challenge = await sql`
      SELECT title, points, language, public_test_cases, hidden_test_cases 
      FROM challenges WHERE id = ${id}
    `;

    if (!challenge.length) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const { title, points, language, public_test_cases, hidden_test_cases } = challenge[0];

    const publicTests = public_test_cases || [];
    const hiddenTests = mode === 'submit' ? (hidden_test_cases || []) : [];
    const allTests = [...publicTests, ...hiddenTests];

    if (allTests.length === 0) {
      return NextResponse.json({ error: 'No test cases configured for this challenge.' }, { status: 400 });
    }

    let totalPassed = 0;
    let publicResults: any[] = [];
    let hiddenPassed = 0;
    let compilationError: string | null = null;

    // 🚀 Run all test cases securely on the backend
    for (let i = 0; i < allTests.length; i++) {
      const tc = allTests[i];
      try {
        // Use the destructured 'language' variable
        const result = await executeCode(code, tc.input || '', language);
        
        if (result.error || result.stderr) {
          compilationError = result.stderr || result.error;
          break; // Stop on first crash
        }

        const passed = result.stdout.trim() === (tc.expected_output || '').trim();
        if (passed) totalPassed++;

        // Only expose public test results to the frontend
        if (i < publicTests.length) {
          publicResults.push({
            passed,
            input: tc.input,
            expected: tc.expected_output,
            actual: result.stdout.trim()
          });
        } else {
          if (passed) hiddenPassed++;
        }
      } catch (err: any) {
        console.error('❌ Test Case Execution Failed:', err.message);
        compilationError = err.message;
        break;
      }
    }

    const totalTests = allTests.length;
    const scorePercent = Math.round((totalPassed / totalTests) * 100);
    const allPassed = totalPassed === totalTests && !compilationError;
    const earnedPoints = allPassed ? points : 0;

    // 💾 Save progress securely to database
    if (mode === 'submit') {
      await sql`
        INSERT INTO challenge_progress (user_id, challenge_id, status, code, solved_at)
        VALUES (${userId}, ${id}, ${allPassed ? 'solved' : 'in_progress'}, ${code}, ${allPassed ? new Date() : null})
        ON CONFLICT (user_id, challenge_id) 
        DO UPDATE SET 
          status = ${allPassed ? 'solved' : 'in_progress'}, 
          code = ${code},
          solved_at = ${allPassed ? new Date() : null}
      `;
    }

    // 🛡️ Send ONLY the safe results back to the frontend
    return NextResponse.json({
      success: allPassed,
      status: compilationError ? 'runtime_error' : (allPassed ? 'accepted' : 'wrong_answer'),
      score: scorePercent,
      earnedPoints,
      publicResults,
      hiddenPassed,
      hiddenTotal: hiddenTests.length,
      errorMessage: compilationError
    });

  } catch (error: any) {
    console.error('❌ Execution API Fatal Error:', error);
    return NextResponse.json({ error: 'Server error during execution', details: error.message }, { status: 500 });
  }
}