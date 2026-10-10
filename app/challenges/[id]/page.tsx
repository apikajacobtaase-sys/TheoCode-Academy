'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
import { useToast } from '@/components/Toast';

const AVAILABLE_LANGUAGES = [
  'Python', 'C', 'C++', 'Java', 'C#',
  'F#', 'PHP', 'Ruby', 'Haskell', 'Go', 'Rust', 'TypeScript'
];

type TabType = 'problem' | 'code' | 'results';

export default function ChallengeEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { showToast } = useToast();

  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('problem');
  
  // 🎯 HIGHLY VISIBLE CUSTOM INPUT STATE
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  const [selectedLanguage, setSelectedLanguage] = useState('C++');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    return () => clearTimeout(timer);
  }, [activeTab, isDescriptionOpen]);

  useEffect(() => {
    if (isSignedIn && id) {
      fetch(`/api/challenges/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setChallenge(data.challenge);
            setCode(data.challenge.starter_code || '// Write your code here\n\n');
            if (data.challenge.language && AVAILABLE_LANGUAGES.includes(data.challenge.language)) {
              setSelectedLanguage(data.challenge.language);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
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
    setActiveTab('results');
    setResults({ status: 'running', message: 'Running code...', type: 'run' });

    try {
      const res = await fetch(`/api/challenges/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          mode: 'run',
          language: selectedLanguage,
          stdin: customInput // 🎯 Sends the custom input
        })
      });
      const data = await res.json();
      setResults({ ...data, type: 'run' });

      if (data.status === 'error' || data.error) {
        showToast('error', '❌ Compilation or Runtime Error', 4000);
      } else {
        showToast('success', '✅ Code executed', 2000);
      }
    } catch {
      setResults({ status: 'error', message: 'Network error.', type: 'run' });
      showToast('error', '❌ Network error', 4000);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setActiveTab('results');
    setResults({ status: 'running', message: 'Grading all tests...', type: 'submit' });

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
        showToast('success', `🎉 Accepted! +${data.earnedPoints || 0} pts`, 5000);
      } else if (data.status === 'wrong_answer') {
        showToast('warning', `⚠️ Wrong Answer — ${data.score || 0}%`, 4000);
      } else {
        showToast('error', '❌ Error', 4000);
      }
    } catch {
      setResults({ status: 'error', message: 'Network error.', type: 'submit' });
      showToast('error', '❌ Network error', 4000);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-[#00D26A] animate-pulse font-mono text-sm">Loading IDE...</div>
      </div>
    );
  }

  if (!isSignedIn || !challenge) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
        Sign in required
      </div>
    );
  }

  const difficultyColor =
    challenge.difficulty === 'easy' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
    challenge.difficulty === 'medium' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
    'text-rose-400 border-rose-500/40 bg-rose-500/10';

  // ===================== RENDER HELPERS =====================

  const renderProblemPanel = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{challenge.title}</h2>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className={`px-2.5 py-1 rounded-md border font-bold ${difficultyColor}`}>
            {challenge.difficulty?.toUpperCase()}
          </span>
          {challenge.points && (
            <span className="px-2.5 py-1 rounded-md border border-gray-700 text-gray-300 bg-gray-800/50">
              {challenge.points} pts
            </span>
          )}
        </div>
      </div>
      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
        {challenge.description}
      </div>
      {(challenge.public_test_cases?.length > 0) && (
        <div className="pt-4 border-t border-gray-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <span>🧪</span> Sample Test Cases
          </h3>
          <div className="space-y-3">
            {challenge.public_test_cases.map((tc: any, i: number) => (
              <div key={i} className="bg-[#1E293B] p-3 md:p-4 rounded-lg border border-gray-700 font-mono text-xs">
                <div className="mb-2">
                  <span className="text-gray-500 font-bold">Input:</span>
                  <pre className="text-[#00D26A] ml-2 mt-1 whitespace-pre-wrap break-all bg-black/40 p-2 rounded">
                    {tc.input || '(empty)'}
                  </pre>
                </div>
                <div>
                  <span className="text-gray-500 font-bold">Expected:</span>
                  <pre className="text-blue-400 ml-2 mt-1 whitespace-pre-wrap break-all bg-black/40 p-2 rounded">
                    {tc.expected_output || '(empty)'}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCodePanel = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
      {/* 1. Editor Toolbar */}
      <div className="bg-[#111827] px-3 py-2 border-b border-gray-800 flex justify-between items-center gap-2 flex-shrink-0">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-black border border-gray-700 text-white text-xs font-mono rounded px-2 py-1.5 focus:outline-none focus:border-[#00D26A] cursor-pointer"
          aria-label="Select programming language"
        >
          {AVAILABLE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <button
          onClick={() => setCode(challenge.starter_code || '')}
          className="text-xs text-gray-400 hover:text-white transition px-2 py-1.5 flex-shrink-0"
        >
          ↺ Reset
        </button>
      </div>

      {/* 2. Monaco Editor */}
      <div className={`flex-1 w-full min-h-[150px] ${isMobile && activeTab !== 'code' ? 'hidden' : 'block'}`}>
        <Editor
          height="100%"
          language={getMonacoLanguage(selectedLanguage)}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: !isMobile },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'Fira Code', 'Courier New', monospace",
            wordWrap: isMobile ? 'off' : 'on',
          }}
        />
      </div>

      {/* 🎯 3. HIGHLY VISIBLE CUSTOM INPUT SECTION */}
      <div className="bg-[#0f172a] border-t border-gray-700 flex-shrink-0">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-200 hover:text-[#00D26A] hover:bg-gray-800/50 transition"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">📥</span> 
            Custom Input (stdin)
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${showCustomInput ? 'bg-[#00D26A]/20 text-[#00D26A]' : 'bg-gray-800 text-gray-400'}`}>
            {showCustomInput ? 'Hide' : 'Show'}
          </span>
        </button>

        {showCustomInput && (
          <div className="px-4 pb-3">
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type input here (e.g., 5 &#10; 1 2 3 4 5 &#10; 3)"
              className="w-full h-24 bg-black border border-gray-600 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-[#00D26A] focus:ring-1 focus:ring-[#00D26A] resize-none placeholder-gray-600"
            />
            <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
              <span>ℹ️</span> This text will be passed to your program's standard input (cin / input()).
            </p>
          </div>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="bg-[#111827] border-t border-gray-800 p-3 flex gap-3 flex-shrink-0">
        <button
          onClick={handleRun}
          disabled={isExecuting}
          className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm font-bold text-white transition border border-gray-700 flex items-center justify-center gap-2"
        >
          {isExecuting && results?.type === 'run' ? '⏳ Running...' : '▶ Run'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isExecuting}
          className="flex-1 px-4 py-3 bg-[#00D26A] hover:bg-[#00b85c] disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm font-bold text-black transition shadow-lg shadow-[#00D26A]/20 flex items-center justify-center gap-2"
        >
          {isExecuting && results?.type === 'submit' ? '⏳ Grading...' : '✓ Submit'}
        </button>
      </div>
    </div>
  );

  const renderResultsPanel = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {!results ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          <div className="text-5xl mb-4 opacity-40">💻</div>
          <p className="text-gray-500 text-sm">Run or submit your code to see results here.</p>
        </div>
      ) : results.status === 'running' ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-2 border-[#00D26A] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#00D26A] font-mono text-sm animate-pulse">{results.message}</p>
        </div>
      ) : results.type === 'run' ? (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><span>💻</span> Run Output</h3>
          {results.error ? (
            <div>
              <p className="text-xs font-bold text-rose-400 mb-2">❌ Execution Error</p>
              <pre className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-xs font-mono">
                {results.error}
              </pre>
            </div>
          ) : results.output ? (
            <div>
              <p className="text-xs font-bold text-[#00D26A] mb-2">✅ Standard Output</p>
              <pre className="bg-black border border-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-xs font-mono leading-relaxed">
                {results.output}
              </pre>
            </div>
          ) : (
            <div className="bg-[#1E293B] border border-gray-800 rounded-lg p-4 text-sm text-gray-500 italic flex items-center gap-2">
              <span className="text-amber-400">⚠️</span> Program executed but produced no output.
            </div>
          )}
        </div>
      ) : results.type === 'submit' ? (
        <div className="space-y-4">
          {results.status === 'accepted' && (
            <div className="bg-[#00D26A]/10 border-2 border-[#00D26A]/50 rounded-xl p-5 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-[#00D26A]">Accepted!</h3>
              {results.earnedPoints > 0 && <p className="text-[#00D26A] font-bold mt-1">+{results.earnedPoints} points</p>}
            </div>
          )}
          {results.status === 'wrong_answer' && (
            <div>
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 mb-4">
                <p className="text-amber-400 font-bold text-sm">⚠️ Wrong Answer</p>
                <p className="text-xs text-gray-400 mt-1">Score: {results.score || 0}%</p>
              </div>
              <div className="space-y-2">
                {results.publicResults?.map((r: any, i: number) => (
                  <details key={i} className={`rounded-lg border overflow-hidden ${r.passed ? 'border-[#00D26A]/30 bg-[#00D26A]/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
                    <summary className="px-3 py-2 cursor-pointer text-xs font-bold flex items-center gap-2 list-none">
                      <span>{r.passed ? '✅' : '❌'}</span>
                      <span className="text-white">Case {i + 1}</span>
                      <span className="ml-auto text-gray-500 text-[10px]">{r.passed ? 'Passed' : 'Failed'}</span>
                    </summary>
                    {!r.passed && (
                      <div className="px-3 pb-3 text-[11px] space-y-2 font-mono border-t border-gray-800 pt-2">
                        <div><span className="text-gray-500">Input:</span><pre className="text-amber-300 whitespace-pre-wrap break-all mt-0.5 bg-black/40 p-1.5 rounded">{r.input || '(empty)'}</pre></div>
                        <div><span className="text-gray-500">Expected:</span><pre className="text-blue-400 whitespace-pre-wrap break-all mt-0.5 bg-black/40 p-1.5 rounded">{r.expected || '(empty)'}</pre></div>
                        <div><span className="text-gray-500">Actual:</span><pre className="text-rose-400 whitespace-pre-wrap break-all mt-0.5 bg-black/40 p-1.5 rounded">{r.actual || '(empty)'}</pre></div>
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </div>
          )}
          {(results.status === 'compile_error' || results.status === 'runtime_error' || results.status === 'error') && (
            <div>
              <p className="text-xs font-bold text-rose-400 mb-2">❌ Error</p>
              <pre className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-xs font-mono">
                {results.compileError || results.error || results.message}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  // ===================== MAIN RENDER =====================
  return (
    <main className="min-h-screen bg-[#0B1120] text-white flex flex-col">
    {/* Header — hidden on desktop (md+) to maximize editor space */}
<header className="bg-[#0f172a] border-b border-gray-800 px-3 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-30 md:hidden">
  <Link href="/" className="flex items-center gap-2 flex-shrink-0">
    <div className="w-7 h-7 rounded bg-[#00D26A] flex items-center justify-center font-black text-black text-sm">T</div>
    <span className="font-bold text-sm md:text-base text-white hidden sm:inline">Theocode</span>
  </Link>
  <nav className="hidden md:flex items-center gap-1 text-sm">
    <Link href="/" className="px-3 py-1.5 text-gray-400 hover:text-white rounded transition">Home</Link>
    <Link href="/challenges" className="px-3 py-1.5 text-[#00D26A] font-bold rounded transition">Challenges</Link>
    <Link href="/profile" className="px-3 py-1.5 text-gray-400 hover:text-white rounded transition">Profile</Link>
  </nav>
</header>

      {/* Title Bar */}
      <div className="bg-[#111827] border-b border-gray-800 px-3 md:px-6 py-2.5 flex items-center gap-2 md:gap-3 flex-shrink-0">
        <button onClick={() => router.push('/challenges')} className="text-gray-400 hover:text-white p-1 flex-shrink-0" aria-label="Back">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-bold text-sm md:text-base text-white truncate flex-1 min-w-0">{challenge.title}</h1>
        <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded border font-bold flex-shrink-0 ${difficultyColor}`}>
          {challenge.difficulty?.toUpperCase()}
        </span>
      </div>

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="bg-[#0f172a] border-b border-gray-800 flex flex-shrink-0">
          {(['problem', 'code', 'results'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'problem' ? 'Problem' : tab === 'code' ? 'Code' : 'Results';
            const icon = tab === 'problem' ? '📄' : tab === 'code' ? '💻' : '📊';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold transition relative ${isActive ? 'text-[#00D26A]' : 'text-gray-500'}`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span>{icon}</span><span>{label}</span>
                </span>
                {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00D26A] rounded-t" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {isMobile ? (
          <>
            <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'problem' ? '' : 'hidden'}`}>{renderProblemPanel()}</div>
            <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'code' ? '' : 'hidden'}`}>{renderCodePanel()}</div>
            <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'results' ? '' : 'hidden'}`}>{renderResultsPanel()}</div>
          </>
        ) : (
          <>
            <div className={`bg-[#0f172a] border-r border-gray-800 flex flex-col transition-all duration-300 overflow-hidden ${isDescriptionOpen ? 'w-2/5 lg:w-1/2' : 'w-0 border-none'}`}>
              <div className={`flex-1 overflow-y-auto transition-opacity ${isDescriptionOpen ? 'opacity-100' : 'opacity-0'}`}>
                {renderProblemPanel()}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
              <div className="bg-[#111827] px-4 py-2 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                <button onClick={() => setIsDescriptionOpen(!isDescriptionOpen)} className="text-xs text-gray-400 hover:text-white transition px-2 py-1 border border-gray-700 rounded">
                  {isDescriptionOpen ? '◀ Hide' : '▶ Show'} Problem
                </button>
              </div>
              {renderCodePanel()}
              
              {/* Desktop Console */}
              <div className={`bg-black border-t border-gray-800 transition-all duration-300 flex flex-col flex-shrink-0 ${results ? 'h-1/3 min-h-[180px]' : 'h-10'}`}>
                <button onClick={() => setResults(results ? null : results)} className="w-full px-4 py-2 flex justify-between items-center text-xs font-bold text-gray-400 hover:bg-gray-900 transition">
                  <span className="flex items-center gap-2">
                    <span>💻 RESULTS</span>
                    {results?.status === 'accepted' && <span className="text-[#00D26A]">✓ Accepted</span>}
                    {results?.status === 'wrong_answer' && <span className="text-amber-400">✗ Failed</span>}
                  </span>
                  <span>{results ? '▼' : '▲'}</span>
                </button>
                {results && (
                  <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
                    {results.status === 'running' && <p className="text-[#00D26A] animate-pulse">{results.message}</p>}
                    {results.type === 'run' && results.status !== 'running' && (
                      results.error ? <pre className="text-rose-300 whitespace-pre-wrap">{results.error}</pre> :
                      results.output ? <pre className="text-gray-200 whitespace-pre-wrap">{results.output}</pre> :
                      <p className="text-gray-500 italic">No output.</p>
                    )}
                    {results.type === 'submit' && results.status === 'accepted' && <p className="text-[#00D26A] font-bold">🎉 Accepted! +{results.earnedPoints} pts</p>}
                    {results.type === 'submit' && results.status === 'wrong_answer' && <p className="text-amber-400">Wrong Answer — {results.score}%</p>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="bg-[#0f172a] border-t border-gray-800 flex items-center justify-around flex-shrink-0 pb-[env(safe-area-inset-bottom)]">
          <Link href="/" className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>
          <Link href="/challenges" className="flex-1 flex flex-col items-center py-2 text-[#00D26A] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-[10px] mt-0.5 font-bold">Challenges</span>
          </Link>
          <Link href="/profile" className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
        </nav>
      )}
    </main>
  );
}