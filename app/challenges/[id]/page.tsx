'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/Toast';

// 🎯 EXACT 12 LANGUAGES SUPPORTED BY ONLINECOMPILER.IO
const AVAILABLE_LANGUAGES = [
  'Python', 'C', 'C++', 'Java', 'C#', 
  'F#', 'PHP', 'Ruby', 'Haskell', 'Go', 'Rust', 'TypeScript'
];

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
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('C++'); 

  useEffect(() => {
    if (isSignedIn && id) {
      fetch(`/api/challenges/${id}`).then(r => r.json()).then(data => {
        if (data.success) {
          setChallenge(data.challenge);
          setCode(data.challenge.starter_code || '// Write your code here\n\n');
          if (data.challenge.language && AVAILABLE_LANGUAGES.includes(data.challenge.language)) {
            setSelectedLanguage(data.challenge.language);
          }
        }
        setLoading(false);
      });
    }
  }, [isSignedIn, id]);

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'C++': case 'C': return 'cpp';
      case 'Python': return 'python';
      case 'Java': return 'java';
      case 'C#': return 'csharp';
      case 'F#': return 'fsharp';
      case 'PHP': return 'php';
      case 'Ruby': return 'ruby';
      case 'Haskell': return 'haskell';
      case 'Go': return 'go';
      case 'Rust': return 'rust';
      case 'TypeScript': case 'JavaScript': return 'typescript';
      default: return 'cpp';
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setIsConsoleOpen(true); 
    setResults({ status: 'running', message: 'Running code...', type: 'run' });

    try {
      const res = await fetch(`/api/challenges/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(), 
          mode: 'run',
          language: selectedLanguage,
          stdin: customInput 
        })
      });
      const data = await res.json();
      setResults({ ...data, type: 'run' }); 
      
      if (data.status === 'error' || data.error) {
        showToast('error', '❌ Compilation or Runtime Error', 4000);
      } else {
        showToast('success', '✅ Code executed successfully', 3000);
      }
    } catch (err) {
      setResults({ status: 'error', message: 'Network error.', type: 'run' });
      showToast('error', '❌ Network error. Please try again.', 4000);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setIsConsoleOpen(true); 
    setResults({ status: 'running', message: 'Submitting and grading all tests...', type: 'submit' });

    try {
      const res = await fetch(`/api/challenges/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(), 
          mode: 'submit',
          language: selectedLanguage,
          stdin: customInput 
        })
      });
      const data = await res.json();
      setResults({ ...data, type: 'submit' });

      if (data.status === 'accepted') {
        showToast('success', `🎉 Challenge Solved! +${data.earnedPoints || 0} Points`, 5000);
      } else if (data.status === 'wrong_answer') {
        showToast('warning', `⚠️ Wrong Answer - Score: ${data.score || 0}%`, 4000);
      } else if (data.status === 'runtime_error' || data.status === 'compile_error') {
        showToast('error', '❌ Compilation or Runtime Error', 4000);
      }
    } catch (err) {
      setResults({ status: 'error', message: 'Network error.', type: 'submit' });
      showToast('error', '❌ Network error. Please try again.', 4000);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isLoaded || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading IDE...</div>;
  if (!isSignedIn || !challenge) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Sign in required</div>;

  return (
    <main className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* HEADER */}
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
          
          <button 
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="hidden md:flex ml-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-300 transition flex items-center gap-2 border border-gray-700 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDescriptionOpen ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="w-full">
            <button 
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs text-gray-400 hover:text-green-400 flex items-center gap-1 transition font-medium mb-2"
            >
              {showCustomInput ? '▼ Hide' : '▶ Show'} Custom Input (stdin)
            </button>
            
            {showCustomInput && (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type input here (e.g., 42)"
                className="w-full h-20 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-green-500 resize-none"
              />
            )}
          </div>

          <div className="flex gap-2 md:gap-3">
            <button onClick={handleRun} disabled={isExecuting} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs md:text-sm font-bold transition">
              {isExecuting ? '⏳ Running...' : '▶ Run'}
            </button>
            <button onClick={handleSubmit} disabled={isExecuting} className="px-4 md:px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs md:text-sm font-bold transition shadow-lg shadow-green-600/20">
              {isExecuting ? '⏳ Grading...' : '✓ Submit'}
            </button>
          </div>
        </div>
      </header>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden relative">
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

        <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0"> 
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-green-500 cursor-pointer hover:bg-gray-700 transition"
                >
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setCode(challenge.starter_code || '')} className="text-xs text-gray-500 hover:text-white transition">Reset Code</button>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <Editor
                height="100%"
                language={getMonacoLanguage(selectedLanguage)}
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

          <div className={`bg-black border-t border-gray-800 transition-all duration-300 flex flex-col flex-shrink-0 ${isConsoleOpen ? 'h-1/3 min-h-[200px]' : 'h-10'}`}>
            <button 
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="w-full px-4 py-2 flex justify-between items-center text-xs font-bold text-gray-400 hover:bg-gray-900 transition"
            >
              <span className="flex items-center gap-2">
                <span>💻 CONSOLE & RESULTS</span>
                {results?.type === 'submit' && results?.status === 'accepted' && <span className="text-green-400">✓ Accepted</span>}
                {results?.type === 'submit' && results?.status === 'wrong_answer' && <span className="text-orange-400">✗ Failed</span>}
                {results?.status === 'error' && <span className="text-red-400">✗ Error</span>}
              </span>
              <span>{isConsoleOpen ? '▼' : '▲'}</span>
            </button>
            
            {isConsoleOpen && results && (
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs md:text-sm">
                {results.status === 'running' && (
                  <p className="text-yellow-400 animate-pulse">{results.message}</p>
                )}

                {results.type === 'run' && results.status !== 'running' && (
                  <div className="space-y-4">
                    {results.error ? (
                      <div className="text-red-400">
                        <p className="font-bold mb-2 text-sm flex items-center gap-2">❌ Execution Error:</p>
                        <pre className="bg-red-900/20 p-3 rounded border border-red-900/50 overflow-x-auto whitespace-pre-wrap text-xs font-mono">
                          {results.error}
                        </pre>
                      </div>
                    ) : results.output ? (
                      <div className="text-gray-300">
                        <p className="font-bold mb-2 text-sm text-green-400 flex items-center gap-2">✅ Standard Output:</p>
                        <pre className="bg-gray-900 p-3 rounded border border-gray-800 overflow-x-auto whitespace-pre-wrap text-xs font-mono leading-relaxed">
                          {results.output}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic p-4 bg-gray-900/50 rounded border border-gray-800 text-sm flex items-center gap-2">
                        <span className="text-yellow-500">⚠️</span> Program executed successfully but produced no output.
                      </div>
                    )}
                  </div>
                )}

                {results.type === 'submit' && results.status !== 'running' && (
                  <>
                    {results.status === 'accepted' && (
                      <div className="p-4 md:p-6 rounded-xl border-2 bg-green-900/20 border-green-500/50 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl md:text-4xl">🎉</span>
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-green-400">Accepted!</h3>
                            {results.earnedPoints > 0 && <p className="text-green-300 font-bold">+{results.earnedPoints} Points</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {results.status === 'wrong_answer' && (
                      <div className="text-orange-400 mb-4">
                        <p className="font-bold mb-2">⚠️ Wrong Answer (Score: {results.score || 0}%)</p>
                        <div className="space-y-2 mt-4">
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

                    {(results.status === 'runtime_error' || results.status === 'compile_error' || results.status === 'error') && (
                      <div className="text-red-400 mb-4">
                        <p className="font-bold mb-2">❌ Compilation / Runtime Error:</p>
                        <pre className="bg-red-900/20 p-3 rounded border border-red-900/50 overflow-x-auto whitespace-pre-wrap text-xs font-mono">
                          {results.compileError || results.error || results.message}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}