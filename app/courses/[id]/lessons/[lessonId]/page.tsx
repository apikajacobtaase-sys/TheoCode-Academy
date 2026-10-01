'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LessonPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [prevLesson, setPrevLesson] = useState<any>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchLesson();
    }
  }, [courseId, lessonId]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data.lesson);
        setAllLessons(data.allLessons || []);
        setPrevLesson(data.prevLesson);
        setNextLesson(data.nextLesson);
        setCurrentIndex(data.currentIndex);
        setTotalLessons(data.totalLessons);
        
        // Check if current lesson is already completed
        const current = data.allLessons?.find((l: any) => l.id === lessonId);
        if (current) setCompleted(current.completed);
      } else {
        console.error('Failed to load lesson');
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'POST'
      });
      if (res.ok) {
        setCompleted(true);
        const data = await res.json();
        
        if (data.courseCompleted) {
          alert('🎉 Congratulations! You completed the entire course!');
          router.push(`/courses/${courseId}`);
        }
      }
    } catch (error) {
      console.error('Failed to mark complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
        <p className="text-gray-400 mb-6">This lesson doesn't exist or has been removed.</p>
        <Link href={`/courses/${courseId}`} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
          ← Back to Course
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link 
            href={`/courses/${courseId}`} 
            className="text-green-400 hover:text-green-300 transition text-sm flex items-center gap-1"
          >
            ← Course
          </Link>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1 lg:hidden"
          >
            📑 Lessons ({currentIndex + 1}/{totalLessons})
          </button>
          <span className="hidden lg:block text-sm text-gray-400">
            Lesson {currentIndex + 1} of {totalLessons}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {prevLesson && (
            <Link
              href={`/courses/${courseId}/lessons/${prevLesson.id}`}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
            >
              ← Prev
            </Link>
          )}
          {nextLesson && (
            <Link
              href={`/courses/${courseId}/lessons/${nextLesson.id}`}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        
        {/* Sidebar - Lesson List */}
        <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 bg-black/80' : 'hidden'} lg:relative lg:block lg:bg-transparent lg:w-80 lg:border-r lg:border-gray-800`}>
          <div className={`${sidebarOpen ? 'w-80 h-full bg-gray-900' : ''} overflow-y-auto h-full`}>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between lg:hidden">
              <h3 className="font-bold text-white">Lessons</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            <div className="p-2">
              {allLessons.map((l: any, idx: number) => (
                <Link
                  key={l.id}
                  href={`/courses/${courseId}/lessons/${l.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`block p-3 rounded-lg mb-1 transition ${
                    l.id === lessonId 
                      ? 'bg-green-600/20 border border-green-500/50' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 mt-0.5">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${l.id === lessonId ? 'text-green-400' : 'text-white'}`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{l.module_title}</p>
                    </div>
                    {l.completed && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            
            {/* Lesson Header */}
            <div className="mb-6">
              <p className="text-sm text-green-400 mb-2">{lesson.module_title}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{lesson.title}</h1>
              
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="px-3 py-1 bg-gray-800 rounded-full">
                  {lesson.item_type === 'video' && '🎥 Video'}
                  {lesson.item_type === 'reading' && '📖 Reading'}
                  {lesson.item_type === 'quiz' && '🧠 Quiz'}
                  {lesson.item_type === 'code' && '💻 Code Exercise'}
                </span>
                {completed && (
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full font-medium">
                    ✅ Completed
                  </span>
                )}
              </div>
            </div>
                                        {/* Lesson Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
              {lesson.item_type === 'video' && lesson.content_url ? (
                // 🎯 Video Renderer with Logo Blocker
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative group">
                  <iframe 
                    src={lesson.content_url} 
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                  {/* 🛡️ Transparent overlay to block YouTube logo clicks */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-auto cursor-default" />
                </div>
              ) : lesson.content_text ? (
                // 🎯 Text Renderer
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                    {lesson.content_text}
                  </div>
                </div>
              ) : (
                // 🎯 Empty State
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">📝</div>
                  <p>Lesson content is being prepared.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex gap-2">
                {prevLesson && (
                  <Link
                    href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                    className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                  >
                    ← Previous Lesson
                  </Link>
                )}
              </div>

              <div className="flex gap-2">
                {!completed && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    className="px-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition flex items-center gap-2"
                  >
                    {markingComplete ? 'Marking...' : '✓ Mark as Complete'}
                  </button>
                )}
                
                {nextLesson && (
                  <Link
                    href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                  >
                    Next Lesson →
                  </Link>
                )}

                {!nextLesson && (
                  <Link
                    href={`/courses/${courseId}`}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition"
                  >
                    🎉 Finish Course
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}