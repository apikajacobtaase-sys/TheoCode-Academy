'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/Toast';

export default function ChallengeEditorPage() {
  const { id } = useParams();
  const { isLoaded, isSignedIn } = useUser();
  const { showToast } = useToast();

  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // 🎯 NEW: State to toggle the description sidebar
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

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
    <main className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* 🎯 HEADER */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 flex justify-between items-center flex-shrink-0 z-20">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/challenges" className="text-gray-400 hover:text-white flex-shrink-0">←</Link>
          <h1 className="font-bold text-lg truncate max-w-[150px] md:max-w-md">{challenge.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${
            challenge.difficulty === 'easy' ? 'border-green-500 text-green-400' : 
            challenge.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'
          }`}>
            {challenge.difficulty.toUpperCase()}
          </span>
          
          {/* 🎯 TOGGLE DESCRIPTION BUTTON */}
          <button 
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="hidden md:flex ml-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-300 transition flex items-center gap-2 border border-gray-700 flex-shrink-0"
            title={isDescriptionOpen ? "Collapse Description" : "Expand Description"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDescriptionOpen ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex gap-2 md:gap-3 flex-shrink-0">
          <button onClick={() => handleExecute('run')} disabled={isExecuting} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs md:text-sm font-bold transition">
            {isExecuting ? '⏳ Running...' : '▶ Run'}
          </button>
          <button onClick={() => handleExecute('submit')} disabled={isExecuting} className="px-4 md:px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs md:text-sm font-bold transition shadow-lg shadow-green-600/20">
            {isExecuting ? '⏳ Grading...' : '✓ Submit'}
          </button>
        </div>
      </header>

      {/* 🎯 SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: Problem Description (Collapsible) */}
        <div className={`bg-gray-950 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          isDescriptionOpen ? 'w-1/2 md:w-2/5' : 'w-0 md:w-0 border-none'
        }`}>
          <div className={`flex-1 overflow-y-auto p-6 space-y-6 transition-opacity duration-200 ${isDescriptionOpen ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-xl font-bold text-gray-200">Description</h2>
            <div className="text-gray-400 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {challenge.description}
            </div>
            
            <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 pt-4 border-t border-gray-800">
              <span>🧪</span> Sample Test Cases
            </h3>
            <div className="space-y-3">
              {(challenge.public_test_cases || []).map((tc: any, i: number) => (
                <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-800 font-mono text-xs md:text-sm">
                  <div className="mb-2">
                    <span className="text-gray-500 font-bold">Input:</span> 
                    <span className="text-green-400 ml-2 break-all">{tc.input}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Expected:</span> 
                    <span className="text-blue-400 ml-2 break-all">{tc.expected_output}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0"> 
          {/* Editor Container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
              <span className="text-xs text-gray-400 font-mono uppercase">{challenge.language}</span>
              <button onClick={() => setCode(challenge.starter_code || '')} className="text-xs text-gray-500 hover:text-white transition">Reset Code</button>
            </div>
            
            <div className="flex-1 w-full min-h-0">
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
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>

          {/* 🎯 Collapsible Console */}
          <div className={`bg-black border-t border-gray-800 transition-all duration-300 flex flex-col flex-shrink-0 ${isConsoleOpen ? 'h-1/3 min-h-[200px]' : 'h-10'}`}>
            <button 
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="w-full px-4 py-2 flex justify-between items-center text-xs font-bold text-gray-400 hover:bg-gray-900 transition"
            >
              <span className="flex items-center gap-2">
                <span>💻 CONSOLE & RESULTS</span>
                {results?.status === 'accepted' && <span className="text-green-400">✓ Accepted</span>}
                {results?.status === 'wrong_answer' && <span className="text-orange-400">✗ Failed</span>}
                {results?.status === 'runtime_error' && <span className="text-red-400">✗ Error</span>}
              </span>
              <span>{isConsoleOpen ? '▼' : '▲'}</span>
            </button>
            
            {isConsoleOpen && results && (
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs md:text-sm">
                {results.status === 'running' && (
                  <p className="text-yellow-400 animate-pulse">{results.message}</p>
                )}
                
                {results.status === 'runtime_error' && (
                  <div className="text-red-400 whitespace-pre-wrap">
                    <p className="font-bold mb-2">❌ Compilation / Runtime Error:</p>
                    <pre className="bg-red-900/20 p-3 rounded border border-red-900/50 overflow-x-auto">
                      {results.errorMessage || results.output}
                    </pre>
                  </div>
                )}

                {results.status === 'accepted' && (
                  <div className="p-4 md:p-6 rounded-xl border-2 bg-green-900/20 border-green-500/50">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl md:text-4xl">🎉</span>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-green-400">Accepted!</h3>
                        {results.earnedPoints > 0 && (
                          <p className="text-green-300 font-bold">+{results.earnedPoints} Points</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Your Score</span>
                        <span className="text-xl md:text-2xl font-bold text-green-400">{results.earnedPoints || 0} pts</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(((results.earnedPoints || 0) / (challenge?.points || 10)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {results.status === 'wrong_answer' && (
                  <div className="text-orange-400">
                    <p className="font-bold mb-2">⚠️ Wrong Answer (Score: {results.score || 0}%)</p>
                    <div className="space-y-2 mt-4">
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Public Test Results:</p>
                      {results.publicResults?.map((r: any, i: number) => (
                        <div key={i} className={`p-3 rounded border ${r.passed ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
                          <p className="font-bold mb-1">Case {i + 1}: {r.passed ? '✅ Passed' : '❌ Failed'}</p>
                          {!r.passed && (
                            <div className="mt-2 text-[11px] space-y-1">
                              <p>Input: <span className="text-yellow-400 break-all">{r.input}</span></p>
                              <p>Expected: <span className="text-blue-400 whitespace-pre-wrap break-all">{r.expected}</span></p>
                              <p>Actual: <span className="text-red-400 whitespace-pre-wrap break-all">{r.actual}</span></p>
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