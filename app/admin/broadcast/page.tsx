'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminBroadcastPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('system');
  
  const [target, setTarget] = useState('all');
  const [targetId, setTargetId] = useState('');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Fetch courses or squads when target changes
  useEffect(() => {
    if (target === 'course') {
      fetch('/api/courses')
        .then(res => res.json())
        .then(data => setCourses(data.courses || []))
        .catch(() => setCourses([]));
    } else if (target === 'squad') {
      fetch('/api/squads')
        .then(res => res.json())
        .then(data => setSquads(data.squads || []))
        .catch(() => setSquads([]));
    }
  }, [target]);

  if (!isLoaded) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Access Denied</div>;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          message, 
          type, 
          link: link || null,
          target,
          targetId: target === 'all' ? null : targetId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, count: data.count });
        setTitle('');
        setMessage('');
        setLink('');
        setTargetId('');
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to send broadcast' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-2xl">
        <Link href="/admin" className="text-green-400 hover:text-green-300 text-sm mb-6 inline-block">
          ← Back to Admin Dashboard
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            📢 Broadcast Message
          </h1>
          <p className="text-gray-400 mb-8">
            Send a custom notification to specific groups of users on the platform.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-6">
            
            {/* 🎯 Target Audience Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <select
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setTargetId(''); // Reset target ID when changing audience
                }}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
              >
                <option value="all">🌍 All Users (Universal)</option>
                <option value="course">📚 Specific Course Enrollees</option>
                <option value="squad">🛡️ Specific Squad Members</option>
              </select>
            </div>

            {/* Conditional Target ID Selector */}
            {target === 'course' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Course</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
                >
                  <option value="">-- Choose a Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            )}

            {target === 'squad' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Squad</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
                >
                  <option value="">-- Choose a Squad --</option>
                  {squads.map((squad) => (
                    <option key={squad.id} value={squad.id}>{squad.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 🎉 New Feature Released!"
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., We've just added 5 new advanced React courses. Check them out now!"
                required
                rows={4}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
                >
                  <option value="system">🔔 System Announcement</option>
                  <option value="challenge_complete">🏆 Challenge Update</option>
                  <option value="course_complete">🎓 Course Update</option>
                  <option value="squad_message">🛡️ Squad News</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Optional Link</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/courses or https://..."
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2 text-white"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending to users...
                </>
              ) : (
                '🚀 Send Broadcast'
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg border ${result.success ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'}`}>
              {result.success ? (
                <p className="font-bold flex items-center gap-2">
                  ✅ Success! Notification sent to {result.count} user{result.count !== 1 ? 's' : ''}.
                </p>
              ) : (
                <p className="font-bold flex items-center gap-2">
                  ❌ Error: {result.error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}