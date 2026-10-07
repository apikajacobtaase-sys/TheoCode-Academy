'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/Toast'; // 🎯 Import the toast hook

export default function ChallengeEditorPage() {
  const { id } = useParams();
  const { isLoaded, isSignedIn } = useUser();
  const { showToast } = useToast(); // 🎯 Initialize the toast hook

  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (isSignedIn && id) {
      fetch(`/api/challenges/${id}`).then(r => r.json()).then(data => {
        if (data.success) {
          setChallenge(data.challenge);
          setCode(data.challenge.starter_code || '// Write your code here\n\n');
        }
        setLoading(false);
      });
    }
  }, [isSignedIn, id]);

  const handleExecute = async (mode: 'run' | 'submit') => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setIsConsoleOpen(true); 
    setResults({ status: 'running', message: mode === 'run' ? 'Running public tests...' : 'Submitting and grading all tests...' });

    try {
      const res = await fetch(`/api/challenges/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), mode })
      });
      const data = await res.json();
      setResults(data);

      // 🎯 Show toast based on result
      if (data.status === 'accepted') {
        showToast('success', `🎉 Challenge Solved! +${data.earnedPoints} Points`, 5000);
      } else if (data.status === 'wrong_answer') {
        showToast('warning', `⚠️ Wrong Answer - Score: ${data.score}%`, 4000);
      } else if (data.status === 'runtime_error') {
        showToast('error', '❌ Compilation or Runtime Error', 4000);
      }
    } catch (err) {
      setResults({ status: 'error', message: 'Network error.' });
      showToast('error', '❌ Network error. Please try again.', 4000);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isLoaded || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading IDE...</div>;
  if (!isSignedIn || !challenge) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Sign in required</div>;

  // 🎯 Map database languages to Monaco Editor language identifiers
  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'C++': return 'cpp';
      case 'Python': return 'python';
      case 'JavaScript': return 'javascript';
      case 'Java': return 'java';
      default: return 'cpp';
    }
  };

  return (
    <main className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/challenges" className="text-gray-400 hover:text-white">←</Link>
          <h1 className="font-bold text-lg">{challenge.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded border ${
            challenge.difficulty === 'easy' ? 'border-green-500 text-green-400' : 
            challenge.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'
          }`}>
            {challenge.difficulty.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExecute('run')} disabled={isExecuting} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition">
            {isExecuting ? '⏳ Running...' : '▶ Run Code'}
          </button>
          <button onClick={() => handleExecute('submit')} disabled={isExecuting} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition shadow-lg shadow-green-600/20">
            {isExecuting ? '⏳ Grading...' : '✓ Submit Solution'}
          </button>
        </div>
      </header>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem */}
        <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-8 bg-gray-950">
          <h2 className="text-xl font-bold mb-4 text-gray-200">Description</h2>
          <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
          
          <h3 className="text-lg font-bold mt-8 mb-3 text-gray-200">Sample Test Cases</h3>
          <div className="space-y-3">
            {(challenge.public_test_cases || []).map((tc: any, i: number) => (
              <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800 font-mono text-xs">
                <div><span className="text-gray-500">Input:</span> <span className="text-green-400">{tc.input}</span></div>
                <div><span className="text-gray-500">Expected:</span> <span className="text-blue-400">{tc.expected_output}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editor & Console */}
        <div className="w-1/2 flex flex-col bg-[#1e1e1e]"> 
          {/* 🎯 REAL CODE EDITOR (Monaco) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
              <span className="text-xs text-gray-400 font-mono uppercase">{challenge.language}</span>
              <button onClick={() => setCode(challenge.starter_code || '')} className="text-xs text-gray-500 hover:text-white transition">Reset Code</button>
            </div>
            
            <div className="flex-1 w-full">
              <Editor
                height="100%"
                language={getMonacoLanguage(challenge.language)}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "'Fira Code', 'Courier New', monospace"
                }}
              />
            </div>
          </div>

          {/* 🎯 Collapsible Console */}
          <div className={`bg-black border-t border-gray-800 transition-all duration-300 flex flex-col ${isConsoleOpen ? 'h-64' : 'h-10'}`}>
            <button 
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="w-full px-4 py-2 flex justify-between items-center text-xs font-bold text-gray-400 hover:bg-gray-900 transition flex-shrink-0"
            >
              <span className="flex items-center gap-2">
                <span>💻 CONSOLE & RESULTS</span>
                {results?.status === 'accepted' && <span className="text-green-400">✓ Accepted</span>}
                {results?.status === 'wrong_answer' && <span className="text-orange-400">✗ Failed</span>}
              </span>
              <span>{isConsoleOpen ? '▼' : '▲'}</span>
            </button>
            
            {isConsoleOpen && results && (
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
                {results.status === 'running' && <p className="text-yellow-400 animate-pulse">{results.message}</p>}
                
                {results.status === 'runtime_error' && (
                  <div className="text-red-400 whitespace-pre-wrap">
                    <p className="font-bold mb-2">❌ Compilation / Runtime Error:</p>
                    <pre className="bg-red-900/20 p-3 rounded border border-red-900/50 overflow-x-auto">{results.errorMessage}</pre>
                  </div>
                )}

                {results.status === 'accepted' && (
                  <div className="text-green-400">
                    <p className="text-lg font-bold mb-2">🎉 Accepted! +{results.earnedPoints} Points</p>
                    <p>Score: {results.score}%</p>
                    {results.hiddenTotal > 0 && <p className="mt-1 text-green-300">Passed {results.hiddenPassed}/{results.hiddenTotal} Hidden Test Cases.</p>}
                  </div>
                )}

                {results.status === 'wrong_answer' && (
                  <div className="text-orange-400">
                    <p className="font-bold mb-2">⚠️ Wrong Answer (Score: {results.score}%)</p>
                    {results.hiddenTotal > 0 && <p className="mb-3 text-orange-300">Passed {results.hiddenPassed}/{results.hiddenTotal} Hidden Test Cases.</p>}
                    
                    <div className="space-y-2 mt-4">
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Public Test Results:</p>
                      {results.publicResults?.map((r: any, i: number) => (
                        <div key={i} className={`p-3 rounded border ${r.passed ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
                          <p className="font-bold mb-1">Case {i + 1}: {r.passed ? '✅ Passed' : '❌ Failed'}</p>
                          {!r.passed && (
                            <div className="mt-2 text-[11px] space-y-1">
                              <p>Input: <span className="text-yellow-400">{r.input}</span></p>
                              <p>Expected: <span className="text-blue-400 whitespace-pre-wrap">{r.expected}</span></p>
                              <p>Actual: <span className="text-red-400 whitespace-pre-wrap">{r.actual}</span></p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}