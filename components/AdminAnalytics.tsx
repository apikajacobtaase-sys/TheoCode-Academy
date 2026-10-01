'use client';

import { useState, useEffect } from 'react';
import { Certificate } from './Certificate';

interface Student {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  completed_modules: number;
  total_modules: number;
  completion_rate: number;
  average_score: number;
  has_certificate: boolean;
  last_activity: string;
  first_activity: string;
}

export function AdminAnalytics({ courseId }: { courseId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [certificateData, setCertificateData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/students`);
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
    setLoading(false);
  };

  const viewStudentCertificate = async (student: Student) => {
    setSelectedStudent(student);
    // Fetch certificate data for this specific student
    try {
      const res = await fetch(`/api/courses/${courseId}/certificate?studentId=${student.user_id}`);
      if (res.ok) {
        const certData = await res.json();
        setCertificateData(certData);
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    }
  };

  if (loading) {
    return <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center text-gray-400">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center text-red-400">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 rounded-2xl p-4 sm:p-6 border border-purple-500/30">
          <p className="text-xs sm:text-sm text-purple-300 mb-1">Total Students</p>
          <p className="text-2xl sm:text-4xl font-bold text-white">{data.totalStudents}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-700/30 rounded-2xl p-4 sm:p-6 border border-green-500/30">
          <p className="text-xs sm:text-sm text-green-300 mb-1">Completed</p>
          <p className="text-2xl sm:text-4xl font-bold text-white">{data.completedStudents}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-700/30 rounded-2xl p-4 sm:p-6 border border-blue-500/30">
          <p className="text-xs sm:text-sm text-blue-300 mb-1">Completion Rate</p>
          <p className="text-2xl sm:text-4xl font-bold text-white">{data.completionRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-700/30 rounded-2xl p-4 sm:p-6 border border-yellow-500/30">
          <p className="text-xs sm:text-sm text-yellow-300 mb-1">Avg Score</p>
          <p className="text-2xl sm:text-4xl font-bold text-white">{data.averageScore}%</p>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-bold">👥 Student Progress</h3>
          <span className="text-xs sm:text-sm text-gray-400">{data.students.length} students enrolled</span>
        </div>

        {data.students.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-500">
            <p className="text-lg mb-2">No students yet</p>
            <p className="text-sm">Students will appear here once they start the course</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-bold text-gray-400">Student</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-bold text-gray-400">Progress</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-bold text-gray-400 hidden sm:table-cell">Avg Score</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-bold text-gray-400">Status</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-bold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.students.map((student: Student) => (
                  <tr key={student.user_id} className="hover:bg-gray-700/30 transition">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/50 rounded-full flex items-center justify-center font-bold text-sm sm:text-base overflow-hidden flex-shrink-0">
                          {student.avatar_url ? (
                            <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            student.full_name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm truncate">{student.full_name || 'Unknown'}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{student.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs sm:text-sm font-bold">{student.completed_modules}/{student.total_modules}</span>
                        <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              student.completion_rate === 100 ? 'bg-green-500' : 
                              student.completion_rate > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${student.completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-400">{student.completion_rate}%</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center hidden sm:table-cell">
                      <span className={`text-sm font-bold ${
                        student.average_score >= 80 ? 'text-green-400' :
                        student.average_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {student.average_score}%
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {student.has_certificate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-[10px] sm:text-xs font-bold">
                          🏆 Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full text-[10px] sm:text-xs">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {student.has_certificate ? (
                        <button
                          onClick={() => viewStudentCertificate(student)}
                          className="px-2 sm:px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs sm:text-sm font-bold"
                        >
                          📜 View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CERTIFICATE MODAL */}
      {selectedStudent && certificateData && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 max-w-3xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Certificate for {selectedStudent.full_name}</h3>
              <button
                onClick={() => { setSelectedStudent(null); setCertificateData(null); }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <Certificate
              userName={certificateData.userName}
              courseTitle={certificateData.courseTitle}
              completedAt={certificateData.completedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}