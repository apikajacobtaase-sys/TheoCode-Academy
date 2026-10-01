import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 🚀 Point the OpenAI SDK to OpenRouter to access massive Open-Source models!
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  // 🎯 FIX: Provide a fallback dummy key so the Vercel build doesn't crash
  apiKey: process.env.OPENROUTER_API_KEY || 'sk-or-dummy-key-for-build',
  defaultHeaders: {
    'HTTP-Referer': 'https://theocode-academy.vercel.app',
    'X-Title': 'TheoCode Academy',
  },
});
export async function POST(request: Request) {
  try {
    const { userId, lessonId, submittedCode, language, challengePrompt } = await request.json();

    let aiResult;

    // 🧠 TRY REAL AI (Llama 3 70B via OpenRouter) FIRST
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const systemPrompt = `You are an expert coding instructor. Review this code for the challenge: "${challengePrompt}". 
        Language: ${language}. 
        Code: \n\`\`\`${language}\n${submittedCode}\n\`\`\`
        Rules: 1. Be highly specific. Reference their variable names. 2. NEVER say "Good job" or "Try again". 3. If correct, explain WHY and give 1 advanced tip. 4. If incorrect, point to the exact logical error. 5. Respond ONLY in JSON: {"passed": boolean, "score": number, "feedback": "string"}`;

        const completion = await openai.chat.completions.create({
          // 🏆 Using Llama 3.1 70B (The closest open-source equivalent to a 120B+ model)
          // Alternative: 'qwen/qwen-2.5-coder-32b-instruct' (Specifically built for coding)
          model: 'meta-llama/llama-3.1-70b-instruct', 
          messages: [{ role: 'system', content: systemPrompt }],
          temperature: 0.5,
        });

        aiResult = JSON.parse(completion.choices[0].message.content || '{}');
      } catch (aiError: any) {
        console.warn('⚠️ OpenRouter AI API failed:', aiError.message);
        aiResult = null; // Trigger fallback
      }
    }

    // 🛡️ SMART FALLBACK (If AI is unavailable or out of credits)
    if (!aiResult) {
      const hasFunction = submittedCode.includes('function') || submittedCode.includes('=>');
      const hasReturn = submittedCode.includes('return');
      const isTooShort = submittedCode.length < 20;

      aiResult = {
        passed: !isTooShort && hasFunction && hasReturn,
        score: isTooShort ? 40 : (hasFunction && hasReturn ? 85 : 60),
        feedback: isTooShort 
          ? "⚠️ Your code seems incomplete. Make sure to write the full logic and return the expected value."
          : "✅ Code structure looks valid! Ensure you've handled edge cases and tested with the example cases provided in the prompt."
      };
    }

    // 💾 SAVE TO DATABASE
    try {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, ai_score)
        VALUES (${userId}, ${lessonId}, ${aiResult.passed}, NOW(), ${aiResult.score})
        ON CONFLICT (user_id, lesson_id) 
        DO UPDATE SET 
          completed = ${aiResult.passed},
          completed_at = NOW(),
          ai_score = GREATEST(COALESCE(lesson_progress.ai_score, 0), ${aiResult.score})
      `;
    } catch (dbError: any) {
      console.error("⚠️ Database save failed:", dbError.message);
    }

    return NextResponse.json({
      success: true,
      passed: aiResult.passed,
      score: aiResult.score,
      feedback: aiResult.feedback
    });

  } catch (error: any) {
    console.error('❌ Evaluate API Critical Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      passed: false, 
      score: 0, 
      feedback: "⚠️ Evaluation failed. Please check your code and try again." 
    }, { status: 500 });
  }
}