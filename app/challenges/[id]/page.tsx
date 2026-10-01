'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react'; // 🎯 Import is safely at the top

export default function ChallengeDetailPage() {
  const { id: challengeId } = useParams();
  const { user, isLoaded } = useUser();
  
  const [challenge, setChallenge] = useState<any>(null);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  const fetchChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch: ${res.status}`);
      }
      
      const data = await res.json();
      setChallenge(data.challenge);
      setUserSubmission(data.userSubmission);
      setCode(data.challenge.starter_code || '// Write your solution here...\n');
    } catch (err: any) {
      setError(err.message || 'Failed to load challenge.');
    } finally {
      setLoading(false);
    }
  };
  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('⚠️ Please write some code first!');
      return;
    }

    setRunning(true);
    setOutput('⏳ Executing code in the secure sandbox...');
    setError(null);

    try {
      const res = await fetch(`/api/challenges/${challengeId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: challenge.language })
      });

      const data = await res.json();
      
      if (res.ok) {
        setOutput(data.output || 'Code executed successfully (no output).');
      } else {
        // 🎯 This will now show the EXACT error from the server
        setOutput(`❌ Execution failed: ${data.error || data.output || 'Unknown error'}`);
      }
    } catch (err: any) {
      setOutput(`❌ Network Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in to submit your solution.');
      return;
    }

    if (!code.trim()) {
      setError('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit solution.');
      }

      const data = await res.json();
      
      if (data.status === 'accepted') {
        setSuccess('🎉 Congratulations! Your solution was accepted!');
        setUserSubmission(data.submission);
      } else {
        setError(`❌ Submission failed: ${data.message || 'Your code did not pass all test cases.'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit solution.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading challenge...</div>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2 text-red-400">Error Loading Challenge</h1>
        <p className="text-gray-400 mb-6 max-w-md">{error}</p>
        <Link href="/challenges" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/challenges" className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block">
            ← Back to Challenges
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{challenge.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              challenge.difficulty === 'easy' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
              challenge.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' :
              'bg-red-600/20 text-red-400 border-red-500/30'
            }`}>
              {challenge.difficulty}
            </span>
          </div>
          <p className="text-gray-400">{challenge.category}</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 font-bold">
            {success}
          </div>
        )}
        {error && challenge && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Problem Description</h2>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {challenge.prompt || challenge.description || 'No description available.'}
            </div>
            
            {challenge.expected_output && (
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h3 className="text-blue-400 font-bold mb-2">Expected Output</h3>
                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{challenge.expected_output}</pre>
              </div>
            )}
            
            {challenge.hints && (
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h3 className="text-yellow-400 font-bold mb-2">💡 Hints</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{challenge.hints}</p>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Code Editor</h2>
              <span className="text-xs text-gray-500">{challenge.language || 'JavaScript'}</span>
            </div>

            {/* 🎯 PROPER MONACO EDITOR COMPONENT */}
            <Editor
              height="400px"
              defaultLanguage={
                challenge.language?.toLowerCase().includes('python') ? 'python' :
                challenge.language?.toLowerCase().includes('c++') ? 'cpp' :
                challenge.language?.toLowerCase().includes('java') ? 'java' :
                'javascript'
              }
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
            
            {/* Output Console - VS Code Terminal Style */}
            {output && (
              <div className="mt-4 bg-[#1e1e1e] border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2 font-mono">Terminal — Output</span>
                </div>
                <pre className="p-4 text-sm text-green-400 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {output}
                </pre>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button 
                onClick={handleRunCode}
                disabled={running}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                {running ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Running...
                  </>
                ) : (
                  '▶️ Run Code'
                )}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Submitting...
                  </>
                ) : (
                  '🚀 Submit'
                )}
              </button>
            </div>

            {userSubmission && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${
                userSubmission.status === 'accepted' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
                Previous Status: {userSubmission.status.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}