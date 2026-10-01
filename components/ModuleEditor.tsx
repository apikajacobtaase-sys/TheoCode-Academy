'use client';

import { useState, useEffect } from 'react';

interface ModuleEditorProps {
  courseId: string;
  module?: any;
  onSave: (moduleData: any) => void;
  onCancel: () => void;
}

export function ModuleEditor({ courseId, module, onSave, onCancel }: ModuleEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuizEditor, setShowQuizEditor] = useState(false);

  useEffect(() => {
    if (module) {
      setTitle(module.title || '');
      setDescription(module.description || '');
      setContents(module.contents || []);
      setQuizQuestions(module.quiz_questions || []);
    }
  }, [module]);

  const handleSave = () => {
    onSave({
      id: module?.id,
      title,
      description,
      contents,
      quiz_questions: quizQuestions
    });
  };

  // Content management
  const addContent = (type: string) => {
    const newContent = {
      id: `temp-${Date.now()}`,
      content_type: type,
      content_url: '',
      content_text: '',
      order_index: contents.length
    };
    setContents([...contents, newContent]);
  };

  const updateContent = (index: number, field: string, value: string) => {
    const updated = [...contents];
    updated[index] = { ...updated[index], [field]: value };
    setContents(updated);
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  // Quiz management
  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      id: `temp-${Date.now()}`,
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      order_index: quizQuestions.length
    }]);
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const updateQuizOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...quizQuestions];
    const options = [...updated[qIndex].options];
    options[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuizQuestions(updated);
  };

  const removeQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {module ? '✏️ Edit Module' : '➕ New Module'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>

      {/* Basic Info */}
      <div>
        <label className="text-base font-bold text-white mb-2 block">📝 Module Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="e.g., Introduction to Python"
        />
      </div>

      <div>
        <label className="text-base font-bold text-white mb-2 block">📋 Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="Brief description of this module..."
        />
      </div>

      {/* Content Section */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📚 Module Content</h3>
          <div className="flex gap-2">
            <button onClick={() => addContent('text')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold">
              📝 Text
            </button>
            <button onClick={() => addContent('image')} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-bold">
              🖼️ Image
            </button>
            <button onClick={() => addContent('video')} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold">
              🎥 Video
            </button>
            <button onClick={() => addContent('youtube')} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-bold">
              📺 YouTube
            </button>
          </div>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/50 rounded-lg border border-gray-700">
            <p className="text-gray-500">No content yet. Click a button above to add text, images, or videos!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contents.map((content, index) => (
              <div key={content.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-purple-400">
                    {content.content_type === 'text' && '📝 Text'}
                    {content.content_type === 'image' && '🖼️ Image'}
                    {content.content_type === 'video' && '🎥 Video'}
                    {content.content_type === 'youtube' && '📺 YouTube'}
                  </span>
                  <button
                    onClick={() => removeContent(index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold"
                  >
                    🗑️ Remove
                  </button>
                </div>

                {content.content_type === 'text' && (
                  <textarea
                    value={content.content_text}
                    onChange={(e) => updateContent(index, 'content_text', e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    placeholder="Write your lesson content here..."
                  />
                )}

                {content.content_type === 'image' && (
                  <div>
                    <input
                      type="url"
                      value={content.content_url}
                      onChange={(e) => updateContent(index, 'content_url', e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm mb-2"
                      placeholder="Image URL (e.g., https://example.com/image.jpg)"
                    />
                    {content.content_url && (
                      <img src={content.content_url} alt="Preview" className="max-w-full rounded-lg border border-gray-700" />
                    )}
                  </div>
                )}

                {content.content_type === 'video' && (
                  <input
                    type="url"
                    value={content.content_url}
                    onChange={(e) => updateContent(index, 'content_url', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    placeholder="Video URL (MP4, WebM, etc.)"
                  />
                )}

                {content.content_type === 'youtube' && (
                  <div>
                    <input
                      type="url"
                      value={content.content_url}
                      onChange={(e) => updateContent(index, 'content_url', e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm mb-2"
                      placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                    />
                    {content.content_url && (
                      <div className="aspect-video rounded-lg overflow-hidden border border-gray-700">
                        <iframe
                          src={content.content_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Section */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🎯 Quiz (Optional)</h3>
          <button
            onClick={() => setShowQuizEditor(!showQuizEditor)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-bold"
          >
            {showQuizEditor ? 'Hide Quiz Editor' : 'Add Quiz Questions'}
          </button>
        </div>

        {showQuizEditor && (
          <div className="space-y-4">
            {quizQuestions.map((q, qIndex) => (
              <div key={q.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-yellow-400">Question {qIndex + 1}</span>
                  <button
                    onClick={() => removeQuizQuestion(qIndex)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold"
                  >
                    🗑️ Remove
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => updateQuizQuestion(qIndex, 'question_text', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm mb-3"
                  placeholder="Enter your question..."
                />

                <div className="space-y-2">
                  {q.options.map((opt: string, oIndex: number) => (
                    <div key={oIndex} className="flex gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct_answer === opt}
                        onChange={() => updateQuizQuestion(qIndex, 'correct_answer', opt)}
                        className="mt-3"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={addQuizQuestion}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold"
            >
              ➕ Add Another Question
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-700">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-base transition"
        >
          💾 Save Module
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-base transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}