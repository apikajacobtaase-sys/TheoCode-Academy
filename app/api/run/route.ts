import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    // Map your app's language names to Piston's supported language names
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
    };

    const pistonLang = languageMap[language.toLowerCase()] || 'python';

    // Call the free Piston API to execute the code
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: '*',
        files: [{ content: code }]
      })
    });

    const result = await response.json();

    if (result.run) {
      return NextResponse.json({
        success: result.run.code === 0,
        output: result.run.stdout || result.run.stderr || 'Code executed with no output.',
        error: result.run.code !== 0 ? result.run.stderr : null
      });
    }

    return NextResponse.json({ success: false, output: 'Execution failed.', error: 'Unknown error' }, { status: 500 });

  } catch (error: any) {
    console.error('❌ Code Execution Error:', error.message);
    return NextResponse.json({ success: false, output: 'Server error during execution.', error: error.message }, { status: 500 });
  }
}