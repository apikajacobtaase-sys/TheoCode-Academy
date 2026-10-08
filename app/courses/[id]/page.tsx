'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';
import DiscussionForum from '@/components/DiscussionForum';
import Certificate from '@/components/Certificate';
// 🎯 Define the exact shape of our progress state
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
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
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

      // Check enrollment
      fetch(`/api/courses/${id}/enroll`).then(r => r.json()).then(data => setEnrolled(data.enrolled));

      // Check progress
      if (isSignedIn) {
        fetch(`/api/courses/${id}/progress`)
          .then(r => r.json())
          .then(data => {
            console.log('📊 Progress data:', data);
            setProgress({
              progress: data.progress || 0,
              completedLessons: data.completedLessons || [],
              totalLessons: data.totalLessons || 0,
              completedCount: data.completedCount || 0
            });
          })
          .catch(err => {
            console.error('❌ Progress fetch error:', err);
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
      } else {
        showToast('error', data.error || 'Failed to generate certificate', 4000);
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
    
    // 🎯 Optimistic UI Update
    if (!progress.completedLessons.includes(lessonId)) {
      const newCompleted = [...progress.completedLessons, lessonId];
      const newProgress = Math.round((newCompleted.length / progress.totalLessons) * 100);
      setProgress({ 
        ...progress, 
        completedLessons: newCompleted, 
        progress: newProgress, 
        completedCount: newCompleted.length 
      });
    }

    try {
      await fetch(`/api/courses/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });
      showToast('success', '✅ Lesson completed!', 3000);
      
      // 🎯 Auto-advance to next lesson
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
        setActiveLesson(lessons[currentIndex + 1]);
      }
    } catch (err) {
      console.error('Mark complete error:', err);
      showToast('error', 'Failed to mark complete', 3000);
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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-gray-400 hover:text-white">←</Link>
            <div>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              <p className="text-xs text-gray-400">{course.instructor} • {course.total_lessons} Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn && enrolled && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Progress</p>
                <p className="text-lg font-bold text-green-400">{progress.progress}%</p>
              </div>
            )}
            {isSignedIn ? (
              !enrolled && (
                <button onClick={handleEnroll} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition">
                  🎓 Enroll Now
                </button>
              )
            ) : (
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition">
                  Sign In to Enroll
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        <aside className="w-80 border-r border-gray-800 overflow-y-auto bg-gray-950 flex-shrink-0 hidden md:block">
          <div className="p-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Course Content</h3>
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isCompleted = progress.completedLessons.includes(lesson.id);
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition flex items-start gap-3 ${
                      isActive ? 'bg-green-600/20 border border-green-500/50' : 'hover:bg-gray-900 border border-transparent'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration_minutes} min</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{activeLesson.title}</h2>
                <p className="text-gray-400">{activeLesson.description}</p>
              </div>

              <div className="space-y-6">
                {activeLesson.items?.map((item: any) => (
                  <div key={item.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
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
                      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300">{item.content}</div>
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
                 {/* 🎯 Discussion Forum */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <DiscussionForum lessonId={activeLesson.id} />
              </div>
              {/* 🎯 Smart Complete Button */}
              {isSignedIn ? (
                !progress.completedLessons?.includes(activeLesson.id) ? (
                  <button
                    onClick={() => markLessonComplete(activeLesson.id)}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                  >
                    ✓ Mark Lesson as Complete
                  </button>
                  
                ) : (
                  <div className="w-full py-3 bg-gray-800 text-green-400 rounded-lg font-bold flex items-center justify-center gap-2 border border-green-500/30">
                    ✅ Completed
                  </div>
                )
              ) : (
                <div className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-bold text-center">
                  Sign in to track your progress
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Select a lesson</div>
          )}
                        {/* 🎯 Certificate Section */}
              {isSignedIn && progress.progress === 100 && !showCertificate && (
                <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/50 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">Congratulations!</h3>
                  <p className="text-gray-300 mb-4">You've completed this entire course!</p>
                  <button
                    onClick={claimCertificate}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-lg font-bold transition shadow-lg"
                  >
                    🎓 Claim Your Certificate
                  </button>
                </div>
              )}

              {showCertificate && certificate && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <Certificate
                    userName={user?.fullName || user?.username || 'Student'}
                    courseTitle={course.title}
                    certificateNumber={certificate.certificate_number}
                    issuedAt={certificate.issued_at}
                    instructorName={course.instructor}
                  />
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="mt-4 text-sm text-gray-400 hover:text-white underline"
                  >
                    Close Certificate
                  </button>
                </div>
              )}
        </div>
      </div>
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
      if (res.ok) {
        setResult(data);
        setSubmitted(true);
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
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