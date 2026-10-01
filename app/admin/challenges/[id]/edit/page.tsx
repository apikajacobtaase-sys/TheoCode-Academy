'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface TestCase {
  input: string;
  expected_output: string;
}

export default function AdminChallengeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [challenge, setChallenge] = useState<any>({
    title: '',
    description: '',
    difficulty: 'easy',
    category: '',
    language: 'javascript',
    prompt: '',
    starter_code: '',
    expected_output: '',
    hints: '',
    points: 10
  });
  
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [hiddenTestCases, setHiddenTestCases] = useState<TestCase[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchChallenge();
    }
  }, [id]);

    const fetchChallenge = async () => {
    try {
      const res = await fetch(`/api/admin/challenges/${id}`);
      if (res.ok) {
        const data = await res.json();
        const c = data.challenge;
        
        // 🎯 Sanitize all values to ensure they are never null
        setChallenge({
          title: c.title ?? '',
          description: c.description ?? '',
          difficulty: c.difficulty ?? 'easy',
          category: c.category ?? '',
          language: c.language ?? 'javascript',
          prompt: c.prompt ?? '',
          starter_code: c.starter_code ?? '',
          expected_output: c.expected_output ?? '',
          hints: c.hints ?? '',
          points: c.points ?? 10
        });
        
        setSampleTestCases(c.sample_test_cases || []);
        setHiddenTestCases(c.hidden_test_cases || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...challenge,
          sample_test_cases: sampleTestCases,
          hidden_test_cases: hiddenTestCases
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Challenge saved successfully!' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: `❌ Failed to save: ${err.error}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const addSampleTestCase = () => {
    setSampleTestCases([...sampleTestCases, { input: '', expected_output: '' }]);
  };

  const addHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: '', expected_output: '' }]);
  };

  const updateSampleTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...sampleTestCases];
    updated[index][field] = value;
    setSampleTestCases(updated);
  };

  const updateHiddenTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...hiddenTestCases];
    updated[index][field] = value;
    setHiddenTestCases(updated);
  };

  const removeSampleTestCase = (index: number) => {
    setSampleTestCases(sampleTestCases.filter((_, i) => i !== index));
  };

  const removeHiddenTestCase = (index: number) => {
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

    return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Edit Challenge</h1>
        <p className="text-gray-400 mt-1">Update details and manage test cases</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-bold ${
          message.type === 'success' ? 'bg-green-600/20 border border-green-500/30 text-green-400' :
          'bg-red-600/20 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Challenge Details Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">Challenge Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={challenge.title}
              onChange={(e) => setChallenge({ ...challenge, title: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Difficulty</label>
            <select
              value={challenge.difficulty}
              onChange={(e) => setChallenge({ ...challenge, difficulty: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
            <input
              type="text"
              value={challenge.category}
              onChange={(e) => setChallenge({ ...challenge, category: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
              placeholder="e.g., Arrays, Strings, Dynamic Programming"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Language</label>
            <select
              value={challenge.language}
              onChange={(e) => setChallenge({ ...challenge, language: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Points</label>
            <input
              type="number"
              value={challenge.points}
              onChange={(e) => setChallenge({ ...challenge, points: parseInt(e.target.value) || 0 })}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-400 mb-2">Problem Description</label>
          <textarea
            value={challenge.prompt}
            onChange={(e) => setChallenge({ ...challenge, prompt: e.target.value })}
            rows={6}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none resize-none"
            placeholder="Describe the problem in detail..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-400 mb-2">Starter Code</label>
          <textarea
            value={challenge.starter_code}
            onChange={(e) => setChallenge({ ...challenge, starter_code: e.target.value })}
            rows={4}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:border-green-500 focus:outline-none resize-none"
            placeholder="// Provide starter code for students..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-400 mb-2">Hints (Optional)</label>
          <textarea
            value={challenge.hints}
            onChange={(e) => setChallenge({ ...challenge, hints: e.target.value })}
            rows={3}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none resize-none"
            placeholder="Provide helpful hints..."
          />
        </div>
      </div>

      {/* Sample Test Cases */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">📋 Sample Test Cases (Visible to Students)</h2>
          <button
            onClick={() => setSampleTestCases([...sampleTestCases, { input: '', expected_output: '' }])}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition text-white"
          >
            + Add Test Case
          </button>
        </div>

        {sampleTestCases.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sample test cases yet.</p>
        ) : (
          <div className="space-y-4">
            {sampleTestCases.map((tc, index) => (
              <div key={index} className="bg-black border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-blue-400">Test Case #{index + 1}</span>
                  <button onClick={() => setSampleTestCases(sampleTestCases.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Input (stdin)</label>
                    <textarea value={tc.input} onChange={(e) => { const u = [...sampleTestCases]; u[index].input = e.target.value; setSampleTestCases(u); }} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Expected Output</label>
                    <textarea value={tc.expected_output} onChange={(e) => { const u = [...sampleTestCases]; u[index].expected_output = e.target.value; setSampleTestCases(u); }} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Test Cases */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">🔒 Hidden Test Cases (Used for Grading)</h2>
          <button
            onClick={() => setHiddenTestCases([...hiddenTestCases, { input: '', expected_output: '' }])}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold transition text-white"
          >
            + Add Test Case
          </button>
        </div>

        {hiddenTestCases.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hidden test cases yet.</p>
        ) : (
          <div className="space-y-4">
            {hiddenTestCases.map((tc, index) => (
              <div key={index} className="bg-black border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-purple-400">Hidden Test #{index + 1}</span>
                  <button onClick={() => setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Input (stdin)</label>
                    <textarea value={tc.input} onChange={(e) => { const u = [...hiddenTestCases]; u[index].input = e.target.value; setHiddenTestCases(u); }} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Expected Output</label>
                    <textarea value={tc.expected_output} onChange={(e) => { const u = [...hiddenTestCases]; u[index].expected_output = e.target.value; setHiddenTestCases(u); }} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition"
        >
          {saving ? 'Saving...' : '💾 Save Challenge'}
        </button>
        <Link
          href="/admin/challenges"
          className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition text-center"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}