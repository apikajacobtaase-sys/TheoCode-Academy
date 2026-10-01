'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';
import CourseReviews from '@/components/CourseReviews';
import ProgressBar from '@/components/ProgressBar';

export default function CourseDetailPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [progress, setProgress] = useState({ progress: 0, completedLessons: 0, totalLessons: 0 });
  const [certificate, setCertificate] = useState<any>(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    console.log('🔍 Course ID from URL:', courseId);
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  useEffect(() => {
    if (user && courseId && isEnrolled) {
      fetch(`/api/courses/${courseId}/progress`)
        .then(res => res.json())
        .then(data => {
          if (data.isEnrolled) {
            setProgress({
              progress: data.progress || 0,
              completedLessons: data.completedLessons || 0,
              totalLessons: data.totalLessons || 0
            });
          }
        })
        .catch(() => {});
    }
  }, [user, courseId, isEnrolled]);

  useEffect(() => {
    if (user && courseId && progress.progress === 100) {
      fetch('/api/certificates')
        .then(res => res.json())
        .then(data => {
          const cert = data.certificates?.find((c: any) => c.course_id === courseId);
          if (cert) setCertificate(cert);
        })
        .catch(() => {});
    }
  }, [user, courseId, progress.progress]);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      console.log('📡 Fetching course:', `/api/courses/${courseId}`);
      const courseRes = await fetch(`/api/courses/${courseId}`);
      console.log('📡 Course Response Status:', courseRes.status);
      
      const syllabusRes = await fetch(`/api/courses/${courseId}/syllabus`);

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        console.log('✅ Course Data Received:', courseData);
        setCourse(courseData.course);
      } else {
        const errorData = await courseRes.json().catch(() => ({}));
        console.error('❌ Course Fetch Failed:', courseRes.status, errorData);
        setFetchError(`Failed to load course: ${errorData.error || courseRes.statusText}`);
      }
      
      if (syllabusRes.ok) {
        const data = await syllabusRes.json();
        setModules(data.modules || []);
      }
       
      if (user && courseRes.ok) {
        try {
          const progressRes = await fetch(`/api/courses/${courseId}/progress`);
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setIsEnrolled(progressData.isEnrolled || false);
          }
        } catch (err) {
          console.error('Failed to fetch progress:', err);
        }
      }
    } catch (error: any) {
      console.error('💥 Fatal Fetch Error:', error);
      setFetchError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        setIsEnrolled(true);
        if (modules.length > 0 && modules[0].items?.length > 0) {
          router.push(`/courses/${courseId}/lessons/${modules[0].items[0].id}`);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      if (res.ok) {
        const data = await res.json();
        setCertificate(data.certificate);
        router.push(`/certificates/${data.certificate.id}`);
      }
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    } finally {
      setGeneratingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl animate-pulse text-green-400">Loading course details...</div>
      </div>
    );
  }

  if (fetchError || !course) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold">Unable to Load Course</h1>
        {fetchError && <p className="text-red-400 bg-red-900/20 p-4 rounded-lg max-w-lg">{fetchError}</p>}
        <p className="text-gray-400">Course ID: {courseId || 'Unknown'}</p>
        <div className="flex gap-4 mt-4">
          <Link href="/explore" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
            ← Back to Explore
          </Link>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // 🎯 Check if course has any lessons
  const firstLessonId = modules[0]?.items?.[0]?.id;

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">
        
        <Link href="/explore" className="text-green-400 hover:text-green-300 text-sm mb-6 inline-flex items-center gap-2 transition">
          ← Back to Explore
        </Link>

        {/* Course Header */}
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 mb-6 shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-gray-300 mb-6 whitespace-pre-line">{course.description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {isLoaded ? (
              user ? (
                isEnrolled ? (
                  // 🎯 FIXED: No extra {} wrapper here
                  firstLessonId ? (
                    <Link 
                      href={`/courses/${courseId}/lessons/${firstLessonId}`}
                      className="flex-1 text-center px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg"
                    >
                      🚀 Continue Learning
                    </Link>
                  ) : (
                    <div className="flex-1 text-center px-8 py-4 bg-gray-700 rounded-xl font-bold text-lg text-gray-300 cursor-not-allowed">
                      📚 Course Content Coming Soon
                    </div>
                  )
                ) : (
                  <button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="flex-1 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    {enrolling ? 'Enrolling...' : '✅ Enroll Now (Free)'}
                  </button>
                )
              ) : (
                <SignInButton mode="modal" forceRedirectUrl={`/courses/${courseId}`}>
                  <button className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                    🔓 Sign In to Start Learning
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="flex-1 px-8 py-4 bg-gray-800 rounded-xl animate-pulse" />
            )}

            <Link 
              href="/explore" 
              className="flex-1 sm:flex-none text-center px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-bold text-lg transition"
            >
              Browse More
            </Link>
          </div>

          {(!isLoaded || !user) && (
            <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-2">
              <span>⭐⭐⭐⭐⭐</span> 
              <span>Join 5,000+ students already learning on TheoCode Academy</span>
            </p>
          )}
        </div>

        {/* Progress Section */}
        {user && isEnrolled && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Your Progress
              </h2>
              <span className="text-sm text-gray-400">
                {progress.completedLessons} of {progress.totalLessons} lessons
              </span>
            </div>
            
            <ProgressBar progress={progress.progress} size="lg" showPercentage={true} />
            
            {progress.progress === 100 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-green-400 font-bold text-lg flex items-center gap-2">
                      🎉 Course Completed!
                    </p>
                    <p className="text-gray-300 text-sm">
                      {certificate ? 'You have earned a certificate for this course.' : 'Claim your certificate now!'}
                    </p>
                  </div>
                  {certificate ? (
                    <Link
                      href={`/certificates/${certificate.id}`}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center gap-2"
                    >
                      🎓 View Certificate
                    </Link>
                  ) : (
                    <button
                      onClick={handleGenerateCertificate}
                      disabled={generatingCert}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition flex items-center gap-2"
                    >
                      {generatingCert ? 'Generating...' : '🎓 Claim Certificate'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Syllabus */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl mb-8">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              📚 What You Will Learn
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {modules.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                Course content is being prepared. Check back soon!
              </div>
            ) : (
              modules.map((mod: any, mIndex: number) => (
                <div key={mod.id} className="p-4 sm:p-6">
                  <h3 className="font-bold text-lg mb-3 text-green-400">
                    Module {mIndex + 1}: {mod.title}
                  </h3>
                  <div className="space-y-2">
                    {mod.items?.map((item: any) => {
                      const icon = item.item_type === 'video' ? '🎥' : 
                                   item.item_type === 'reading' ? '📖' : 
                                   item.item_type === 'quiz' ? '🧠' : '💻';
                      
                      return (
                        <div key={item.id} className="flex items-center gap-3 text-gray-400 p-2 rounded hover:bg-gray-800/50 transition">
                          <span className="text-lg">{icon}</span>
                          <span className="text-sm sm:text-base flex-1">{item.title}</span>
                          
                          {(!isLoaded || !user || !isEnrolled) && (
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 flex items-center gap-1">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <CourseReviews courseId={courseId as string} isEnrolled={isEnrolled} />

      </div>
    </main>
  );
}