'use client';

import { useState } from 'react';

interface ContentBlock {
  id: string;
  content_type: string;
  content: string;
  order_index: number;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  order_index: number;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  contents?: ContentBlock[];
  questions?: Question[];
}

export function ModuleViewer({ module, onComplete }: { module: Module; onComplete?: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const calculateScore = () => {
    if (!module.questions) return 0;
    let correct = 0;
    module.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    return Math.round((correct / module.questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
  setShowResults(true);
  const score = calculateScore();
  
  // Save progress to database
  try {
    await fetch(`/api/courses/${module.course_id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId: module.id,
        completed: true,
        score: score
      })
    });
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
  
  if (onComplete) onComplete(score);
};

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="mb-6">
        <span className="text-xs text-purple-400 font-bold">Module {module.order_index + 1}</span>
        <h2 className="text-2xl font-bold mt-1">{module.title}</h2>
        {module.description && <p className="text-gray-400 mt-2">{module.description}</p>}
      </div>

      {/* CONTENT BLOCKS */}
      <div className="space-y-4 mb-8">
        {(module.contents || []).map((block) => (
          <div key={block.id} className="bg-gray-900 p-4 rounded-lg">
            {block.content_type === 'text' && (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{block.content}</div>
              </div>
            )}
            {block.content_type === 'image' && (
              <div className="flex justify-center">
                <img src={block.content} alt="Module content" className="max-w-full rounded-lg max-h-96" />
              </div>
            )}
            {block.content_type === 'video' && (
              <div className="flex justify-center">
                <video src={block.content} controls className="max-w-full rounded-lg max-h-96" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QUIZ */}
      {module.questions && module.questions.length > 0 && (
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-bold mb-4">📝 Quiz</h3>
          <div className="space-y-6">
            {module.questions.map((q, index) => (
              <div key={q.id} className="bg-gray-900 p-4 rounded-lg">
                <p className="font-bold mb-3">
                  <span className="text-purple-400">Q{index + 1}.</span> {q.question_text}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswer(q.id, opt)}
                      disabled={showResults}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        answers[q.id] === opt
                          ? showResults
                            ? opt === q.correct_answer
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {showResults && (
                  <p className="mt-2 text-sm">
                    {answers[q.id] === q.correct_answer ? (
                      <span className="text-green-400">✓ Correct!</span>
                    ) : (
                      <span className="text-red-400">✗ Correct answer: {q.correct_answer}</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!showResults ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length !== module.questions.length}
              className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold"
            >
              Submit Quiz
            </button>
          ) : (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg text-center">
              <p className="text-2xl font-bold">Your Score: {calculateScore()}%</p>
              {onComplete && (
                <button onClick={() => onComplete(calculateScore())} className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold">
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}