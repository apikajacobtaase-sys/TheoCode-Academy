'use client';
import { useState, useEffect } from 'react';
import { useIsAdmin } from '@/lib/useIsAdmin';

export default function AdminCertificatesPage() {
  const { isAdmin } = useIsAdmin();
  const [completions, setCompletions] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/completions')
        .then(res => res.json())
        .then(data => setCompletions(data.completions || []));
    }
  }, [isAdmin]);

  if (!isAdmin) return <div className="p-8 text-white">Access Denied</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🎓 Certificate Requests</h1>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Course</th>
              <th className="p-4">Completed On</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {completions.map((c, i) => (
              <tr key={i} className="hover:bg-gray-700/50">
                <td className="p-4">{c.user_name} ({c.user_email})</td>
                <td className="p-4">{c.course_title}</td>
                <td className="p-4">{new Date(c.completed_at).toLocaleDateString()}</td>
                <td className="p-4">
                  {c.certificate_issued ? (
                    <span className="text-green-400 font-bold">✅ Issued</span>
                  ) : (
                    <span className="text-yellow-400 font-bold">⏳ Pending</span>
                  )}
                </td>
              </tr>
            ))}
            {completions.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No course completions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}