'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Link from 'next/link';

interface TestCase {
  input: string;
  expected_output: string;
}

export default function NewChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    points: 10,
    language: 'C++',
    category: 'Algorithms',
    starter_code: '// Write your starter code here\n\n'
  });

  const [publicTests, setPublicTests] = useState<TestCase[]>([
    { input: '', expected_output: '' }
  ]);

  const [hiddenTests, setHiddenTests] = useState<TestCase[]>([
    { input: '', expected_output: '' }
  ]);

  const addPublicTest = () => {
    setPublicTests([...publicTests, { input: '', expected_output: '' }]);
  };

  const removePublicTest = (index: number) => {
    setPublicTests(publicTests.filter((_, i) => i !== index));
  };

  const updatePublicTest = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...publicTests];
    updated[index][field] = value;
    setPublicTests(updated);
  };

  const addHiddenTest = () => {
    setHiddenTests([...hiddenTests, { input: '', expected_output: '' }]);
  };

  const removeHiddenTest = (index: number) => {
    setHiddenTests(hiddenTests.filter((_, i) => i !== index));
  };

  const updateHiddenTest = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...hiddenTests];
    updated[index][field] = value;
    setHiddenTests(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          public_test_cases: publicTests.filter(t => t.input || t.expected_output),
          hidden_test_cases: hiddenTests.filter(t => t.input || t.expected_output)
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Challenge created successfully!');
        router.push('/challenges');
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to create challenge'));
      }
    } catch (error) {
      alert('❌ Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white">←</Link>
            <h1 className="text-2xl font-bold">Create New Challenge</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold transition"
          >
            {loading ? 'Creating...' : '✓ Create Challenge'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">📝 Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="e.g., Two Sum"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none resize-none"
                  placeholder="Describe the problem in detail..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Points</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="C++">C++</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    placeholder="e.g., Arrays"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Starter Code */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">💻 Starter Code</h2>
            <div className="h-64 border border-gray-700 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                language={form.language === 'C++' ? 'cpp' : form.language.toLowerCase()}
                theme="vs-dark"
                value={form.starter_code}
                onChange={(value) => setForm({ ...form, starter_code: value || '' })}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>
          </div>

          {/* Public Test Cases */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🔓 Public Test Cases</h2>
              <button
                type="button"
                onClick={addPublicTest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition"
              >
                + Add Test Case
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">These are visible to students for practice.</p>

            <div className="space-y-4">
              {publicTests.map((tc, i) => (
                <div key={i} className="bg-black/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-400">Test Case {i + 1}</span>
                    {publicTests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePublicTest(i)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Input</label>
                      <textarea
                        value={tc.input}
                        onChange={(e) => updatePublicTest(i, 'input', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="e.g., 15"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Expected Output</label>
                      <textarea
                        value={tc.expected_output}
                        onChange={(e) => updatePublicTest(i, 'expected_output', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="e.g., 1&#10;2&#10;Fizz..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Test Cases */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🔒 Hidden Test Cases</h2>
              <button
                type="button"
                onClick={addHiddenTest}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition"
              >
                + Add Test Case
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">These are secret and used for grading. Students cannot see these.</p>

            <div className="space-y-4">
              {hiddenTests.map((tc, i) => (
                <div key={i} className="bg-black/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-400">Hidden Test {i + 1}</span>
                    {hiddenTests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHiddenTest(i)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Input</label>
                      <textarea
                        value={tc.input}
                        onChange={(e) => updateHiddenTest(i, 'input', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="e.g., 100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Expected Output</label>
                      <textarea
                        value={tc.expected_output}
                        onChange={(e) => updateHiddenTest(i, 'expected_output', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="e.g., 1&#10;2&#10;Fizz..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/challenges" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold transition shadow-lg shadow-green-600/20"
            >
              {loading ? 'Creating...' : '✓ Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}