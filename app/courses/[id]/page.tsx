'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';
import DiscussionForum from '@/components/DiscussionForum';
import Certificate from '@/components/Certificate';

interface ProgressState {
  progress: number;
  completedLessons: string[];
  totalLessons: number;
  completedCount: number;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const { showToast } = useToast();
  
  // 🎯 Sidebar & UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // 🎯 NEW: Desktop collapse/expand
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  
  const [progress, setProgress] = useState<ProgressState>({ 
    progress: 0, 
    completedLessons: [], 
    totalLessons: 0, 
    completedCount: 0 
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/courses/${id}`).then(r => r.json()).then(data => {
        if (data.course) {
          setCourse(data.course);
          setLessons(data.lessons || []);
          if (data.lessons?.length > 0) setActiveLesson(data.lessons[0]);
        }
        setLoading(false);
      });

      fetch(`/api/courses/${id}/enroll`).then(r => r.json()).then(data => setEnrolled(data.enrolled));

      if (isSignedIn) {
        fetch(`/api/courses/${id}/progress`)
          .then(r => r.json())
          .then(data => {
            setProgress({
              progress: data.progress || 0,
              completedLessons: data.completedLessons || [],
              totalLessons: data.totalLessons || 0,
              completedCount: data.completedCount || 0
            });
          });
      }
    }
  }, [id, isSignedIn]);

  const handleEnroll = async () => {
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, { method: 'POST' });
      if (res.ok) {
        setEnrolled(true);
        showToast('success', '🎉 Enrolled successfully!', 3000);
      }
    } catch {
      showToast('error', 'Failed to enroll', 3000);
    }
  };

  const handleUnenroll = async () => {
    if (!isSignedIn) return;
    setIsUnenrolling(true);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, { method: 'DELETE' });
      if (res.ok) {
        setEnrolled(false);
        setShowUnenrollConfirm(false);
        showToast('success', '👋 Unenrolled successfully', 3000);
        setTimeout(() => { window.location.href = '/courses'; }, 1000);
      } else {
        showToast('error', 'Failed to unenroll', 3000);
      }
    } catch {
      showToast('error', 'Failed to unenroll', 3000);
    } finally {
      setIsUnenrolling(false);
    }
  };

  const claimCertificate = async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setCertificate(data.certificate);
        setShowCertificate(true);
        showToast('success', '🏆 Certificate generated!', 4000);
      }
    } catch {
      showToast('error', 'Failed to generate certificate', 4000);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!isSignedIn) {
      showToast('warning', 'Sign in to track progress', 3000);
      return;
    }
    
    if (!progress.completedLessons.includes(lessonId)) {
      const newCompleted = [...progress.completedLessons, lessonId];
      const newProgress = Math.round((newCompleted.length / progress.totalLessons) * 100);
      setProgress({ ...progress, completedLessons: newCompleted, progress: newProgress, completedCount: newCompleted.length });
    }

    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      setActiveLesson(lessons[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast('success', '✅ Lesson completed!', 3000);

    try {
      await fetch(`/api/courses/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });
    } catch (err) {
      console.error('Mark complete error:', err);
    }
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-400 animate-pulse">Loading...</div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Link href="/courses" className="text-green-400 hover:underline">← Back to Courses</Link>
      </div>
    );
  }

  const isDiscussionUnlocked = isSignedIn && progress.completedLessons.includes(activeLesson?.id);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      
      {/* 🎯 1. DESKTOP HEADER (Cleaned up, no duplicates) */}
      <header className="hidden md:block bg-gray-900 border-b border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-gray-400 hover:text-white">← Back</Link>
            <div>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              <p className="text-xs text-gray-400">{course.instructor} • {lessons.length} Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn && enrolled ? (
              <>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-lg font-bold text-green-400">{progress.progress}%</p>
                </div>
                <button
                  onClick={() => setShowUnenrollConfirm(true)}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition border border-red-500/30"
                  title="Leave this course"
                >
                  Unenroll
                </button>
              </>
            ) : isSignedIn ? (
              <button onClick={handleEnroll} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition">
                🎓 Enroll
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* 🎯 2. MOBILE HEADER (Only one instance now) */}
      <header className="md:hidden sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-bold text-sm truncate flex-1">{course.title}</h1>
        
        {isSignedIn && enrolled ? (
          <button onClick={() => setShowUnenrollConfirm(true)} className="p-2 text-red-400 hover:text-red-300" title="Unenroll">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        ) : !enrolled ? (
          <Link href="/courses" className="p-2 text-gray-400 hover:text-white">✕</Link>
        ) : null}
      </header>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full relative">
        
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}
        
        {/* 🎯 3. COLLAPSIBLE SIDEBAR */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 bg-gray-950 border-r border-gray-800 transform transition-all duration-300 overflow-y-auto
          md:static md:transform-none md:z-auto md:flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0'}
          ${isSidebarExpanded ? 'md:w-80' : 'md:w-20'}
        `}>
          <div className="p-4 border-b border-gray-800 flex items-center justify-between md:justify-center gap-2">
            {isSidebarExpanded ? (
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider whitespace-nowrap">Content</h3>
            ) : (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            
            {/* Desktop Toggle Button */}
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
              className="hidden md:flex p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition"
              title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isSidebarExpanded ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Mobile Close Button */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1">✕</button>
          </div>
          
          <div className="p-2 space-y-1">
            {lessons.map((lesson, idx) => {
              const isCompleted = progress.completedLessons.includes(lesson.id);
              const isActive = activeLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLesson(lesson);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                    isActive ? 'bg-green-600/20 border border-green-500/50' : 'hover:bg-gray-900 border border-transparent'
                  } ${!isSidebarExpanded ? 'justify-center md:px-2' : ''}`}
                  title={!isSidebarExpanded ? lesson.title : ''}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  {isSidebarExpanded && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration_minutes} min</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 🎯 4. MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-black">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              <div className="md:hidden">
                 <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
              </div>

              <div className="space-y-6 animate-in fade-in duration-300" key={activeLesson.id}>
                {activeLesson.items?.map((item: any) => (
                  <div key={item.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 md:p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      {item.item_type === 'video' && '🎥'}
                      {item.item_type === 'quiz' && '📝'}
                      {item.item_type === 'text' && '📄'}
                      {item.item_type === 'link' && '🔗'}
                      {item.item_type === 'image' && '🖼️'}
                      {item.item_type === 'pdf' && '📑'}
                      {item.title}
                    </h3>

                    {item.item_type === 'video' && (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
                        {item.content?.includes('youtube.com') || item.content?.includes('youtu.be') ? (
                          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${item.content.split('v=')[1]?.split('&')[0] || item.content.split('/').pop()}`} frameBorder="0" allowFullScreen></iframe>
                        ) : (
                          <video src={item.content} controls className="w-full h-full" />
                        )}
                      </div>
                    )}

                    {item.item_type === 'text' && (
                      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300 text-sm md:text-base">{item.content}</div>
                    )}

                    {item.item_type === 'link' && (
                      <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{item.content}</a>
                    )}

                    {item.item_type === 'image' && (
                      <img src={item.file_url || item.content} alt={item.title} className="max-w-full rounded-lg border border-gray-700" />
                    )}

                    {item.item_type === 'pdf' && (
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition">
                        📄 View PDF Document
                      </a>
                    )}

                    {item.item_type === 'quiz' && item.questions?.length > 0 && (
                      <QuizComponent itemId={item.id} questions={item.questions} />
                    )}
                  </div>
                ))}
              </div>

              {/* Complete Button */}
              {isSignedIn ? (
                !progress.completedLessons?.includes(activeLesson.id) ? (
                  <button
                    onClick={() => markLessonComplete(activeLesson.id)}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 sticky bottom-4 md:static z-30"
                  >
                    ✓ Mark Lesson as Complete
                  </button>
                ) : (
                  <div className="w-full py-4 bg-gray-800 text-green-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-500/30">
                    ✅ Completed
                  </div>
                )
              ) : (
                <div className="w-full py-4 bg-gray-800 text-gray-400 rounded-xl font-bold text-center">
                  Sign in to track your progress
                </div>
              )}

              {/* Discussion Section */}
              <div className="pt-8 border-t border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">💬 Discussion</h3>
                {isDiscussionUnlocked ? (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 md:p-6">
                    <DiscussionForum lessonId={activeLesson.id} />
                  </div>
                ) : (
                  <div className="bg-gray-900/30 border border-dashed border-gray-700 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-3">🔒</div>
                    <h4 className="text-lg font-bold text-white mb-2">Discussion Locked</h4>
                    <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">Complete this lesson to unlock the discussion board and ask questions!</p>
                    <button onClick={() => markLessonComplete(activeLesson.id)} className="text-green-400 hover:text-green-300 text-sm font-bold underline underline-offset-4">
                      I've finished this lesson
                    </button>
                  </div>
                )}
              </div>

              {showCertificate && certificate && (
  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 md:p-6 mt-8 overflow-x-auto">
    {/* 🎯 The overflow-x-auto ensures it can scroll horizontally on tiny screens if needed, 
        but the responsive Certificate component above should fit perfectly! */}
    <Certificate
      userName={user?.fullName || user?.username || 'Student'}
      courseTitle={course.title}
      certificateNumber={certificate.certificate_number}
      issuedAt={certificate.issued_at}
      instructorName={course.instructor}
    />
    <button
      onClick={() => setShowCertificate(false)}
      className="mt-4 w-full md:w-auto text-sm text-gray-400 hover:text-white underline py-2"
    >
      Close Certificate
    </button>
  </div>
)}

              {showCertificate && certificate && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-8">
                  <Certificate userName={user?.fullName || user?.username || 'Student'} courseTitle={course.title} certificateNumber={certificate.certificate_number} issuedAt={certificate.issued_at} instructorName={course.instructor} />
                  <button onClick={() => setShowCertificate(false)} className="mt-4 text-sm text-gray-400 hover:text-white underline">Close Certificate</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Select a lesson</div>
          )}
        </div>
      </div>

      {/* 🎯 5. UNENROLL CONFIRMATION MODAL */}
      {showUnenrollConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Unenroll from Course?</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-2">If you unenroll, you will:</p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4 list-disc">
                <li>Lose all your progress in this course</li>
                <li>Be removed from the course roster</li>
                <li>Need to re-enroll to access content again</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUnenrollConfirm(false)} disabled={isUnenrolling} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition disabled:opacity-50">
                Keep Learning
              </button>
              <button onClick={handleUnenroll} disabled={isUnenrolling} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isUnenrolling ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Leaving...</>) : 'Unenroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function QuizComponent({ itemId, questions }: { itemId: string; questions: any[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${itemId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) { setResult(data); setSubmitted(true); }
    } catch (err) { alert('Network error'); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => {
        const qResult = submitted ? result?.results.find((r: any) => r.question_id === q.id) : null;
        return (
          <div key={q.id} className="space-y-3">
            <p className="font-medium text-white">{idx + 1}. {q.question_text}</p>
            <div className="space-y-2">
              {q.options.map((opt: string, optIdx: number) => {
                let btnClass = "w-full text-left p-3 rounded-lg border transition flex items-center gap-3 ";
                if (submitted) {
                  if (opt === qResult?.correct_answer) btnClass += "bg-green-600/20 border-green-500 text-green-400";
                  else if (opt === qResult?.user_answer && !qResult?.is_correct) btnClass += "bg-red-600/20 border-red-500 text-red-400";
                  else btnClass += "bg-gray-800 border-gray-700 text-gray-500";
                } else {
                  btnClass += answers[q.id] === opt ? "bg-purple-600/20 border-purple-500 text-white" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700";
                }
                return (
                  <button key={optIdx} disabled={submitted} onClick={() => setAnswers({ ...answers, [q.id]: opt })} className={btnClass}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + optIdx)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!submitted ? (
        <button onClick={handleSubmit} disabled={isSubmitting || Object.keys(answers).length < questions.length} className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-lg font-bold transition">
          {isSubmitting ? 'Grading...' : 'Submit Quiz'}
        </button>
      ) : (
        <div className="text-center p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <p className="text-2xl font-bold text-white mb-2">You scored {result.score} out of {result.total}!</p>
          <p className={`text-lg font-bold ${result.percentage >= 70 ? 'text-green-400' : 'text-orange-400'}`}>{result.percentage}%</p>
        </div>
      )}
    </div>
  );
}