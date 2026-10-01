'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function ModuleViewerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const { user } = useUser();

  const [module, setModule] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (courseId && moduleId) {
      fetchModule();
      fetchCourse();
      checkCompletion();
    }
  }, [courseId, moduleId]);

    const fetchModule = async () => {
  try {
    console.log('🔍 Fetching module from:', `/api/courses/${courseId}/modules/${moduleId}`);
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Module data received:', data);
      setModule(data.module);
    } else {
      console.error('❌ Failed to fetch module:', res.status, res.statusText);
    }
  } catch (error) {
    console.error('Failed to fetch module:', error);
  }
  setLoading(false);
};
  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    }
  };

  const checkCompletion = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/progress`);
      if (res.ok) {
        const data = await res.json();
        setCompleted(data.completed || false);
      }
    } catch (error) {
      console.error('Failed to check completion:', error);
    }
  };

  const handleMarkComplete = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          completed: true,
          score: quizSubmitted ? quizScore : 100
        })
      });

      if (res.ok) {
        setCompleted(true);
        setMessage('✅ Module completed! Great job!');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('❌ Failed to save progress');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleQuizSubmit = () => {
    if (!module?.quiz_questions || module.quiz_questions.length === 0) return;

    let correct = 0;
    module.quiz_questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correct_answer) {
        correct++;
      }
    });

    const score = Math.round((correct / module.quiz_questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    setMessage(`🎯 Quiz Score: ${score}% (${correct}/${module.quiz_questions.length} correct)`);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: answer });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading module...</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Module not found</div>
      </div>
    );
  }

  const contents = module.contents || [];
  const quizQuestions = module.quiz_questions || [];
  const currentContent = contents[currentContentIndex];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/courses/${courseId}`} className="text-purple-400 hover:text-purple-300 text-sm mb-2 block">
            ← Back to {course?.title || 'Course'}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{module.title}</h1>
          {module.description && (
            <p className="text-gray-400 text-lg">{module.description}</p>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-bold ${
            message.includes('✅') || message.includes('🎯') ? 'bg-green-900/30 text-green-400 border border-green-500' : 'bg-red-900/30 text-red-400 border border-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* Content Section */}
        {contents.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">📚 Module Content</h2>
              <span className="text-sm text-gray-400">
                {currentContentIndex + 1} / {contents.length}
              </span>
            </div>

            {/* Content Display */}
            {currentContent && (
              <div className="min-h-[300px]">
                {currentContent.content_type === 'text' && (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                      {currentContent.content_text}
                    </div>
                  </div>
                )}

                {currentContent.content_type === 'image' && (
                  <div className="flex justify-center">
                    <img
                      src={currentContent.content_url}
                      alt="Module content"
                      className="max-w-full rounded-lg border border-gray-700"
                    />
                  </div>
                )}

                {currentContent.content_type === 'video' && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-700">
                    <video
                      src={currentContent.content_url}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                {currentContent.content_type === 'youtube' && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-700">
                    <iframe
                      src={currentContent.content_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {contents.length > 1 && (
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setCurrentContentIndex(Math.max(0, currentContentIndex - 1))}
                  disabled={currentContentIndex === 0}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg font-bold transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentContentIndex(Math.min(contents.length - 1, currentContentIndex + 1))}
                  disabled={currentContentIndex === contents.length - 1}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg font-bold transition"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quiz Section */}
        {quizQuestions.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold mb-6">🎯 Module Quiz</h2>

            <div className="space-y-6">
              {quizQuestions.map((question: any, qIndex: number) => (
                <div key={qIndex} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <p className="font-bold text-lg mb-4">
                    {qIndex + 1}. {question.question_text}
                  </p>

                  <div className="space-y-2">
                    {question.options.map((option: string, oIndex: number) => (
                      <label
                        key={oIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                          quizAnswers[qIndex] === option
                            ? 'bg-purple-900/50 border-2 border-purple-500'
                            : 'bg-gray-800 border-2 border-transparent hover:border-gray-600'
                        } ${
                          quizSubmitted && option === question.correct_answer
                            ? 'bg-green-900/30 border-green-500'
                            : ''
                        } ${
                          quizSubmitted && quizAnswers[qIndex] === option && option !== question.correct_answer
                            ? 'bg-red-900/30 border-red-500'
                            : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={option}
                          checked={quizAnswers[qIndex] === option}
                          onChange={() => handleQuizAnswer(qIndex, option)}
                          disabled={quizSubmitted}
                          className="w-5 h-5"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-lg transition"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500 rounded-lg text-center">
                <p className="text-2xl font-bold">
                  {quizScore >= 80 ? '🎉 Excellent!' : quizScore >= 60 ? '👍 Good job!' : '📚 Keep studying!'}
                </p>
                <p className="text-lg mt-2">
                  You scored {quizScore}% ({Object.values(quizAnswers).filter((a, i) => a === quizQuestions[i]?.correct_answer).length}/{quizQuestions.length})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Completion Section */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          {completed ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-2">Module Completed!</h3>
              <p className="text-gray-400 mb-4">
                You've successfully completed this module. Great work!
              </p>
              {quizSubmitted && (
                <p className="text-lg font-bold text-purple-400">
                  Quiz Score: {quizScore}%
                </p>
              )}
              <Link
                href={`/courses/${courseId}`}
                className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
              >
                Continue to Next Module →
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Ready to complete this module?</h3>
              <button
                onClick={handleMarkComplete}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition"
              >
                ✅ Mark as Complete
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}