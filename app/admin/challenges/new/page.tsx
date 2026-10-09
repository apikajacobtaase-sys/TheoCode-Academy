'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
// Note: Adjust this import path if your toast component is located elsewhere
import { useToast } from '@/components/Toast'; 

export default function CreateChallengePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    points: 10,
    language: 'C++',
    starter_code: '',
    category: 'general',
    test_cases: '[\n  {\n    "input": "",\n    "expected_output": "",\n    "is_public": true\n  }\n]'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'points' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      showToast('error', 'You must be signed in to create a challenge.');
      return;
    }

    // Validate JSON before sending
    try {
      JSON.parse(formData.test_cases);
    } catch {
      showToast('error', 'Invalid JSON in Test Cases. Please check the format.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create challenge');
      }

      showToast('success', '🎉 Challenge created successfully!');
      router.push('/admin/challenges'); // Redirect to your admin list page
    } catch (error: any) {
      showToast('error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading Admin...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">You must be signed in to access the admin panel.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-400">Create New Challenge</h1>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
            ← Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange} required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500"
              placeholder="e.g., Two Sum"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} required rows={6}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500"
              placeholder="Describe the problem, constraints, and examples..."
            />
          </div>

          {/* Grid: Difficulty, Points, Language, Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
              <input type="number" name="points" value={formData.points} onChange={handleChange} required min="1" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select name="language" value={formData.language} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500">
                <option value="C++">C++</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="C#">C#</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="PHP">PHP</option>
                <option value="Ruby">Ruby</option>
                <option value="TypeScript">TypeScript</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500" placeholder="e.g., Arrays" />
            </div>
          </div>

          {/* Starter Code */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Starter Code</label>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <Editor
                height="200px"
                language={formData.language === 'C++' ? 'cpp' : formData.language.toLowerCase()}
                theme="vs-dark"
                value={formData.starter_code}
                onChange={(value) => setFormData(prev => ({ ...prev, starter_code: value || '' }))}
                options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false }}
              />
            </div>
          </div>

          {/* Test Cases */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Cases (JSON) <span className="text-xs text-gray-500 ml-2">Must be a valid JSON array</span>
            </label>
            <textarea
              name="test_cases" value={formData.test_cases} onChange={handleChange} required rows={8}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs font-mono text-green-400 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit" disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-400 rounded-lg text-white font-bold transition shadow-lg shadow-green-600/20"
            >
              {isSubmitting ? 'Creating Challenge...' : '🚀 Publish Challenge'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}