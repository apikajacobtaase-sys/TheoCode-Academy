'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/Toast';
import NotificationBell from '@/components/NotificationBell';

type Tab = 'problem' | 'code' | 'results';

export default function ChallengeEditorPage() {
  const { id } = useParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const { showToast } = useToast();

  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('problem');
  const [isConsoleOpen, setIsConsoleOpen] = useState(true); // Desktop console toggle
  
  const editorRef = useRef<any>(null);

  // Fetch Challenge Data
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

  // Fetch Username
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/profiles/me').then(r => r.json()).then(data => {
        if (data.username) setUsername(data.username);
      });
    }
  }, [isSignedIn, user]);

  // Force Monaco Editor to recalculate layout when switching tabs or resizing
  useEffect(() => {
    if (activeTab === 'code' && editorRef.current) {
      setTimeout(() => editorRef.current?.layout(), 100);
    }
  }, [activeTab, isConsoleOpen]);

  const handleExecute = async (mode: 'run' | 'submit') => {
    if (!code.trim()) return;
    setIsExecuting(true);
    
    // Auto-switch to results on mobile
    if (window.innerWidth < 768) {
      setActiveTab('results');
    } else {
      setIsConsoleOpen(true); // Auto-open console on desktop
    }

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

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 animate-pulse font-medium">Loading IDE...</div>;
  }
  if (!isSignedIn || !challenge) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Sign in required</div>;
  }

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
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      
      {/* ==========================================
          1. TOP NAVIGATION (Global App Nav)
      =========================================== */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="TheoCode" width={32} height={32} className="object-contain group-hover:scale-105 transition" />
            <span className="font-extrabold text-lg tracking-tight text-white hidden sm:block">THEO<span className="text-green-500">CODE</span></span>
          </Link>
        </div>
        
        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link href="/explore" className="hover:text-white transition">Explore</Link>
          <Link href="/courses" className="hover:text-white transition">Courses</Link>
          <Link href="/challenges" className="text-green-500">Challenges</Link>
          <Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
        </nav>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link href={username ? `/profile/${username}` : '/profile/me'} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>
        </div>
      </header>

      {/* ==========================================
          2. CHALLENGE TOOLBAR
      =========================================== */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/challenges" className="text-gray-400 hover:text-white transition p-1" aria-label="Back">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-bold text-base md:text-lg text-white truncate">{challenge.title}</h1>
            <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded border font-bold uppercase tracking-wider flex-shrink-0 ${
              challenge.difficulty === 'easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 
              challenge.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' : 
              'border-red-500/30 text-red-400 bg-red-500/10'
            }`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono mr-2">{challenge.language}</span>
          <button onClick={() => setCode(challenge.starter_code || '')} className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition">
            Reset Code
          </button>
          <button onClick={() => handleExecute('run')} disabled={isExecuting} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm font-bold transition flex items-center gap-2 disabled:opacity-50">
            {isExecuting ? '⏳' : '▶'} {isExecuting ? 'Running...' : 'Run'}
          </button>
          <button onClick={() => handleExecute('submit')} disabled={isExecuting} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm font-bold transition shadow-lg shadow-green-900/20 flex items-center gap-2 disabled:opacity-50">
            {isExecuting ? '⏳' : '✓'} {isExecuting ? 'Grading...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* ==========================================
          3. MOBILE TABS
      =========================================== */}
      <div className="md:hidden flex bg-black border-b border-gray-800 flex-shrink-0">
        {(['problem', 'code', 'results'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ==========================================
          4. MAIN WORKSPACE
      =========================================== */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* --- MOBILE VIEWPORT --- */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden pb-20">
          
          {/* Problem Panel */}
          {activeTab === 'problem' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <h2 className="text-lg font-bold text-white mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">{challenge.description}</p>
              </div>
              
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-green-500">🧪</span> Sample Test Cases
                </h3>
                <div className="space-y-3">
                  {(challenge.public_test_cases || []).map((tc: any, i: number) => (
                    <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800 font-mono text-xs overflow-x-auto">
                      <div className="mb-1.5"><span className="text-gray-500 font-bold">Input:</span> <span className="text-green-400 ml-2 whitespace-pre">{tc.input}</span></div>
                      <div><span className="text-gray-500 font-bold">Expected:</span> <span className="text-blue-400 ml-2 whitespace-pre">{tc.expected_output}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Code Panel */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                <span className="text-xs text-gray-400 font-mono uppercase">{challenge.language}</span>
                <button onClick={() => setCode(challenge.starter_code || '')} className="text-xs text-gray-500 hover:text-white transition">Reset</button>
              </div>
              <div className="flex-1 w-full min-h-0">
                <Editor
                  height="100%"
                  language={getMonacoLanguage(challenge.language)}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 15,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    wordWrap: 'off',
                    renderLineHighlight: 'all',
                  }}
                />
              </div>
            </div>
          )}

          {/* Results Panel */}
          {activeTab === 'results' && (
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {!results ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center py-10">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-sans font-medium">Run or Submit your code to see results here.</p>
                </div>
              ) : results.status === 'running' ? (
                <p className="text-yellow-400 animate-pulse">{results.message}</p>
              ) : results.status === 'runtime_error' ? (
                <div className="text-red-400">
                  <p className="font-bold mb-2 font-sans">❌ Compilation / Runtime Error:</p>
                  <pre className="bg-red-900/20 p-3 rounded border border-red-900/50 overflow-x-auto text-xs">{results.errorMessage || results.output}</pre>
                </div>
              ) : results.status === 'accepted' ? (
                <div className="p-5 rounded-xl border-2 bg-green-900/20 border-green-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🎉</span>
                    <div>
                      <h3 className="text-xl font-bold text-green-400 font-sans">Accepted!</h3>
                      {results.earnedPoints > 0 && <p className="text-green-300 font-bold font-sans">+{results.earnedPoints} Points</p>}
                    </div>
                  </div>
                  {results.output && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-1 font-sans">Output:</p>
                      <pre className="bg-black/50 p-3 rounded text-xs text-gray-300 overflow-x-auto">{results.output}</pre>
                    </div>
                  )}
                </div>
              ) : results.status === 'wrong_answer' ? (
                <div className="text-orange-400">
                  <p className="font-bold mb-2 font-sans">⚠️ Wrong Answer (Score: {results.score || 0}%)</p>
                  <div className="space-y-3 mt-4">
                    {results.publicResults?.map((r: any, i: number) => (
                      <div key={i} className={`p-3 rounded border ${r.passed ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
                        <p className="font-bold mb-1 font-sans text-xs">Case {i + 1}: {r.passed ? '✅ Passed' : '❌ Failed'}</p>
                        {!r.passed && (
                          <div className="mt-2 text-[11px] space-y-1 font-sans">
                            <p>Input: <span className="text-yellow-400 break-all">{r.input}</span></p>
                            <p>Expected: <span className="text-blue-400 whitespace-pre-wrap break-all">{r.expected}</span></p>
                            <p>Actual: <span className="text-red-400 whitespace-pre-wrap break-all">{r.actual}</span></p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* --- DESKTOP VIEWPORT (Professional Split Layout) --- */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          
          {/* Left Panel: Problem Description */}
          <div className="w-5/12 lg:w-1/2 border-r border-gray-800 flex flex-col bg-gray-950 min-w-0">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 text-gray-100">Problem Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap text-[15px]">{challenge.description}</p>
              </div>
              
              <h3 className="text-lg font-bold mt-8 mb-4 text-gray-200 flex items-center gap-2">
                <span className="text-green-500">🧪</span> Sample Test Cases
              </h3>
              <div className="space-y-3">
                {(challenge.public_test_cases || []).map((tc: any, i: number) => (
                  <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-800 font-mono text-sm">
                    <div className="mb-2"><span className="text-gray-500 font-bold">Input:</span> <span className="text-green-400 ml-2">{tc.input}</span></div>
                    <div><span className="text-gray-500 font-bold">Expected Output:</span> <span className="text-blue-400 ml-2">{tc.expected_output}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Editor & Console */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0">
            
            {/* Editor Area */}
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isConsoleOpen ? 'h-2/3' : 'h-full'}`}>
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono uppercase">{challenge.language}</span>
                  <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition">
                    {isConsoleOpen ? '▼ Hide' : '▲ Show'} Console
                  </button>
                </div>
                <button onClick={() => setCode(challenge.starter_code || '')} className="text-xs text-gray-500 hover:text-white transition">Reset Code</button>
              </div>
              <div className="flex-1 w-full min-h-0">
                <Editor
                  height="100%"
                  language={getMonacoLanguage(challenge.language)}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    wordWrap: 'off',
                    renderLineHighlight: 'all',
                  }}
                />
              </div>
            </div>

            {/* Collapsible Console/Results Panel */}
            {isConsoleOpen && (
              <div className="h-1/3 min-h-[200px] bg-black border-t border-gray-800 flex flex-col">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console & Results</span>
                  <button onClick={() => setIsConsoleOpen(false)} className="text-gray-500 hover:text-white transition">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                  {!results ? (
                    <p className="text-gray-500 italic">Run or submit code to see results here.</p>
                  ) : results.status === 'running' ? (
                    <p className="text-yellow-400 animate-pulse">{results.message}</p>
                  ) : results.status === 'accepted' ? (
                    <div className="text-green-400">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🎉</span>
                        <p className="font-bold text-lg">Accepted! +{results.earnedPoints} Points</p>
                      </div>
                      {results.output && <pre className="bg-gray-900 p-3 rounded mt-2 overflow-x-auto text-xs border border-gray-800">{results.output}</pre>}
                    </div>
                  ) : results.status === 'wrong_answer' ? (
                    <div className="text-orange-400">
                      <p className="font-bold mb-3 text-lg">⚠️ Wrong Answer (Score: {results.score || 0}%)</p>
                      <div className="space-y-2">
                        {results.publicResults?.map((r: any, i: number) => (
                          <div key={i} className={`p-3 rounded border ${r.passed ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
                            <p className="font-bold text-xs mb-1">Case {i + 1}: {r.passed ? '✅ Passed' : '❌ Failed'}</p>
                            {!r.passed && (
                              <div className="mt-2 text-[11px] space-y-1">
                                <p>Expected: <span className="text-blue-400">{r.expected}</span></p>
                                <p>Actual: <span className="text-red-400">{r.actual}</span></p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : results.status === 'runtime_error' ? (
                    <div className="text-red-400">
                      <p className="font-bold mb-2 text-lg">❌ Compilation / Runtime Error:</p>
                      <pre className="bg-red-900/20 p-3 rounded border border-red-900/50 overflow-x-auto text-xs">{results.errorMessage || results.output}</pre>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ==========================================
          5. MOBILE STICKY ACTION BAR
      =========================================== */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-3 flex gap-3 z-30 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button 
          onClick={() => handleExecute('run')} 
          disabled={isExecuting} 
          className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isExecuting ? '⏳' : '▶'} {isExecuting ? 'Running...' : 'Run'}
        </button>
        <button 
          onClick={() => handleExecute('submit')} 
          disabled={isExecuting} 
          className="flex-1 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50"
        >
          {isExecuting ? '⏳' : '✓'} {isExecuting ? 'Grading...' : 'Submit'}
        </button>
      </div>

      {/* ==========================================
          6. MOBILE BOTTOM NAVIGATION
      =========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center py-2 z-40 pb-[env(safe-area-inset-bottom)]">
        <Link href="/" className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-white transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-white transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[10px] font-medium">Learn</span>
        </Link>
        <Link href="/challenges" className="flex flex-col items-center gap-1 p-2 text-green-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          <span className="text-[10px] font-bold">Challenges</span>
        </Link>
        <Link href={username ? `/profile/${username}` : '/profile/me'} className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-white transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

    </div>
  );
}