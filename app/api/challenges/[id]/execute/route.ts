import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

// 🎯 EXACT OFFICIAL COMPILER IDENTIFIERS FROM ONLINECOMPILER.IO
const COMPILER_MAP: Record<string, string> = {
  'Python': 'python-3.14',
  'python': 'python-3.14',
  'C': 'gcc-15',
  'c': 'gcc-15',
  'C++': 'g++-15',
  'cpp': 'g++-15',
  'Java': 'openjdk-25',
  'java': 'openjdk-25',
  'C#': 'dotnet-csharp-9',
  'csharp': 'dotnet-csharp-9',
  'F#': 'dotnet-fsharp-9',
  'fsharp': 'dotnet-fsharp-9',
  'PHP': 'php-8.5',
  'php': 'php-8.5',
  'Ruby': 'ruby-4.0',
  'ruby': 'ruby-4.0',
  'Haskell': 'haskell-9.12',
  'haskell': 'haskell-9.12',
  'Go': 'go-1.26',
  'go': 'go-1.26',
  'Rust': 'rust-1.93',
  'rust': 'rust-1.93',
  'TypeScript': 'typescript-deno',
  'JavaScript': 'typescript-deno',
  'typescript': 'typescript-deno',
  'javascript': 'typescript-deno'
};

interface ExecutionResult {
  output: string;
  error: string;
  status: string;
  exit_code: number | string | null;
  time?: string | number;
  memory?: string | number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<any>> {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const body = await request.json();
    const { code, language, mode, stdin } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const [challenge] = await sql`
      SELECT id, title, points, test_cases FROM challenges WHERE id = ${challengeId}
    `;

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const API_URL = 'https://api.onlinecompiler.io/api/run-code-sync/';
    const API_KEY = process.env.ONLINE_COMPILER_API_KEY;

    if (!API_KEY) {
      return NextResponse.json({
        type: mode,
        status: 'error',
        error: 'Missing API Configuration: Please set ONLINE_COMPILER_API_KEY in your .env.local file.',
      });
    }

    const compilerId = COMPILER_MAP[language || 'C++'] || 'g++-15';

    const executeProviderCode = async (sourceCode: string, input: string = ''): Promise<ExecutionResult> => {
      // 🎯 CRITICAL FIX: Only include 'input' if it actually has content
      const payload: any = {
        compiler: compilerId,
        code: sourceCode,
      };
      
      if (input && input.trim() !== '') {
        payload.input = input;
      }

      console.log('📤 SENDING TO API:', JSON.stringify(payload, null, 2));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_KEY, 
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('📥 RAW API RESPONSE:', responseText);
      
      let providerData: any;
      try {
        providerData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ API returned HTML instead of JSON:', responseText.substring(0, 200));
        throw new Error(`API returned HTML. Check your API_KEY. Response: ${responseText.substring(0, 100)}...`);
      }

      return {
        output: providerData.output || '',
        error: providerData.error || '',
        status: providerData.status || 'error',
        exit_code: providerData.exit_code ?? null,
        time: providerData.time,
        memory: providerData.memory,
      };
    };

    // ==========================================
    // 🎯 MODE 1: RUN
    // ==========================================
    if (mode === 'run') {
      const result = await executeProviderCode(code, stdin || '');
      
      return NextResponse.json({
        type: 'run',
        status: result.status,
        output: result.output,
        error: result.error,
        exit_code: result.exit_code,
        time: result.time,
        memory: result.memory,
      });
    }

    // ==========================================
    // 🎯 MODE 2: SUBMIT
    // ==========================================
    if (mode === 'submit') {
      const testCases = typeof challenge.test_cases === 'string' 
        ? JSON.parse(challenge.test_cases) 
        : challenge.test_cases || [];

      if (!testCases || testCases.length === 0) {
        return NextResponse.json({ error: 'No test cases found' }, { status: 400 });
      }

      let passedCount = 0;
      const publicResults = [];
      let compileError = '';

      for (const tc of testCases) {
        const result = await executeProviderCode(code, tc.input || '');

        if (result.error) {
          compileError = result.error;
          break; 
        }

        const actualOutput = (result.output || '').trim();
        const expectedOutput = (tc.expected_output || '').trim();
        const isPassed = actualOutput === expectedOutput;

        if (isPassed) passedCount++;

        if (tc.is_public !== false) { 
          publicResults.push({
            input: tc.input,
            expected: tc.expected_output,
            actual: actualOutput,
            passed: isPassed
          });
        }
      }

      const totalCases = testCases.length;
      const isAccepted = passedCount === totalCases && !compileError;
      const earnedPoints = isAccepted ? (challenge.points || 10) : 0;
      
      const status = isAccepted ? 'accepted' : (compileError ? 'compile_error' : 'wrong_answer');

      await sql`
        INSERT INTO challenge_submissions (user_id, challenge_id, code, language, status, earned_points)
        VALUES (${user.id}, ${challengeId}, ${code}, ${language || 'C++'}, ${status}, ${earnedPoints})
      `;

      if (isAccepted) {
        await sql`
          INSERT INTO challenge_progress (user_id, challenge_id, status, solved_at)
          VALUES (${user.id}, ${challengeId}, 'solved', NOW())
          ON CONFLICT (user_id, challenge_id) 
          DO UPDATE SET status = 'solved', solved_at = NOW()
        `;
      }

      return NextResponse.json({ 
        type: 'submit',
        success: true,
        status,
        score: Math.round((passedCount / totalCases) * 100),
        earnedPoints,
        compileError,
        publicResults,
      });
    }

    return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Execute Error:', error);
    return NextResponse.json({ error: 'Failed to execute code', details: error.message }, { status: 500 });
  }
}