'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';
import { UploadButton } from "@/lib/uploadthing";
export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();

  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', video_url: '', duration_minutes: 0 });

  // 🎯 New state for lesson items
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [lessonItems, setLessonItems] = useState<any[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [newItem, setNewItem] = useState<any>({
    item_type: 'text',
    title: '',
    content: '',
    file_url: '',
    metadata: { questions: [] }
  });

  useEffect(() => {
    if (isAdmin && id) {
      fetch(`/api/admin/courses/${id}`)
        .then(r => r.json())
        .then(data => {
          setCourse(data.course);
          setLessons(data.lessons || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isAdmin, id]);

  useEffect(() => {
    if (selectedLesson) {
      fetch(`/api/admin/lessons/${selectedLesson}/items`)
        .then(r => r.json())
        .then(data => setLessonItems(data.items || []))
        .catch(() => {});
    }
  }, [selectedLesson]);

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      if (res.ok) {
        showToast('success', '✅ Course saved!', 3000);
      } else {
        showToast('error', 'Failed to save', 3000);
      }
    } catch {
      showToast('error', 'Network error', 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) {
      showToast('error', 'Lesson title is required', 3000);
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLesson, order_index: lessons.length })
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', '✅ Lesson added!', 3000);
        setNewLesson({ title: '', description: '', content: '', video_url: '', duration_minutes: 0 });
        setShowLessonForm(false);
        const refresh = await fetch(`/api/admin/courses/${id}`);
        const refreshData = await refresh.json();
        setLessons(refreshData.lessons || []);
        setCourse(refreshData.course);
      }
    } catch {
      showToast('error', 'Failed to add lesson', 3000);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await fetch(`/api/admin/lessons/${lessonId}?courseId=${id}`, { method: 'DELETE' });
      setLessons(lessons.filter(l => l.id !== lessonId));
      showToast('success', '🗑️ Lesson deleted', 3000);
    } catch {
      showToast('error', 'Failed to delete', 3000);
    }
  };

  const handleAddItem = async () => {
    if (!selectedLesson) return;
    if (!newItem.title.trim()) {
      showToast('error', 'Item title is required', 3000);
      return;
    }

    try {
      const res = await fetch(`/api/admin/lessons/${selectedLesson}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          order_index: lessonItems.length
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', '✅ Item added!', 3000);
        setNewItem({ item_type: 'text', title: '', content: '', file_url: '', metadata: { questions: [] } });
        setShowItemForm(false);
        // Refresh items
        const refresh = await fetch(`/api/admin/lessons/${selectedLesson}/items`);
        const refreshData = await refresh.json();
        setLessonItems(refreshData.items || []);
      }
    } catch {
      showToast('error', 'Failed to add item', 3000);
    }
  };

   const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/lessons/${selectedLesson}/items/${itemId}`, { 
        method: 'DELETE' 
      });
      
      if (res.ok) {
        // 🎯 Only update UI if the API actually succeeded
        setLessonItems(lessonItems.filter(i => i.id !== itemId));
        showToast('success', '🗑️ Item deleted', 3000);
      } else {
        const errorData = await res.json();
        showToast('error', errorData.error || 'Failed to delete', 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('error', 'Network error while deleting', 3000);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'quiz': return '📝';
      case 'link': return '🔗';
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'text': return '📝';
      default: return '📦';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold">Course not found</h2>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="text-gray-400 hover:text-white">←</Link>
            <h1 className="text-2xl font-bold">✏️ Edit Course</h1>
          </div>
          <button onClick={handleSaveCourse} disabled={saving} className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold transition">
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Course Details */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">📝 Course Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase">Title</label>
              <input
                type="text"
                value={course.title || ''}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase">Description</label>
              <textarea
                value={course.description || ''}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                rows={4}
                className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase">Instructor</label>
                <input
                  type="text"
                  value={course.instructor || ''}
                  onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase">Difficulty</label>
                <select
                  value={course.difficulty || 'beginner'}
                  onChange={(e) => setCourse({ ...course, difficulty: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase">Duration (h)</label>
                <input
                  type="number"
                  value={course.duration_hours || 0}
                  onChange={(e) => setCourse({ ...course, duration_hours: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase">Published</label>
                <select
                  value={course.is_published ? 'true' : 'false'}
                  onChange={(e) => setCourse({ ...course, is_published: e.target.value === 'true' })}
                  className="w-full mt-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="false">Draft</option>
                  <option value="true">Published</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📖 Lessons ({lessons.length})</h2>
            <button
              onClick={() => setShowLessonForm(!showLessonForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition"
            >
              {showLessonForm ? '✕ Cancel' : '+ Add Lesson'}
            </button>
          </div>

          {showLessonForm && (
            <div className="bg-black/50 border border-blue-500/30 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Lesson title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="Lesson description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="url"
                  placeholder="Video URL (optional)"
                  value={newLesson.video_url}
                  onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newLesson.duration_minutes}
                  onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button onClick={handleAddLesson} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition">
                ✓ Add Lesson
              </button>
            </div>
          )}

          {lessons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No lessons yet. Click "Add Lesson" to get started.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="bg-black/50 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-4 p-4 hover:border-gray-600 transition">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{lesson.duration_minutes} min</p>
                    </div>
                    <button
                      onClick={() => setSelectedLesson(selectedLesson === lesson.id ? null : lesson.id)}
                      className="px-3 py-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded text-sm transition"
                    >
                      {selectedLesson === lesson.id ? '✕ Close' : '📦 Manage Items'}
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-sm transition"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* 🎯 Lesson Items Section */}
                  {selectedLesson === lesson.id && (
                    <div className="border-t border-gray-700 p-4 bg-gray-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-gray-300">Content Items</h3>
                        <button
                          onClick={() => setShowItemForm(!showItemForm)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold transition"
                        >
                          {showItemForm ? '✕ Cancel' : '+ Add Item'}
                        </button>
                      </div>

                      {showItemForm && (
                        <div className="bg-black/50 border border-purple-500/30 rounded-lg p-4 mb-4 space-y-3">
                          <select
                            value={newItem.item_type}
                            onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                          >
                            <option value="text">📝 Text/Markdown</option>
                            <option value="video">🎥 Video (YouTube/URL)</option>
                            <option value="quiz">📝 Quiz</option>
                            <option value="link">🔗 External Link</option>
                            <option value="image">🖼️ Image</option>
                            <option value="pdf">📄 PDF/File</option>
                          </select>

                          <input
                            type="text"
                            placeholder="Item title"
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                          />

                          {(newItem.item_type === 'text' || newItem.item_type === 'video' || newItem.item_type === 'link') && (
                            <textarea
                              placeholder={newItem.item_type === 'video' ? 'Video URL (YouTube, Vimeo, etc.)' : newItem.item_type === 'link' ? 'External URL' : 'Content (Markdown supported)'}
                              value={newItem.content}
                              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none"
                            />
                          )}

                          {(newItem.item_type === 'image' || newItem.item_type === 'pdf') && (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-400 uppercase">Upload File</label>
    <UploadButton
      endpoint="courseMedia"
      onClientUploadComplete={(res) => {
        if (res && res[0]) {
          setNewItem({ ...newItem, file_url: res[0].url });
          showToast('success', '✅ File uploaded!', 3000);
        }
      }}
      onUploadError={(error: Error) => {
        showToast('error', `❌ Upload failed: ${error.message}`, 4000);
      }}
      className="ut-button:bg-purple-600 ut-button:hover:bg-purple-500 ut-button:text-white ut-button:font-bold ut-button:py-2 ut-button:px-4 ut-button:rounded-lg"
    />
    {newItem.file_url && (
      <p className="text-xs text-green-400">✓ File uploaded: {newItem.file_url.substring(0, 50)}...</p>
    )}
  </div>
)}

                        {newItem.item_type === 'quiz' && (
  <div className="space-y-4 border border-purple-500/30 rounded-lg p-4 bg-gray-900/50">
    <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2">
      📝 Quiz Questions
    </h4>
    {newItem.metadata.questions.map((q: any, qIdx: number) => (
      <div key={qIdx} className="bg-black/50 p-4 rounded border border-gray-700 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase">Question {qIdx + 1}</span>
          <button
            onClick={() => {
              const updated = newItem.metadata.questions.filter((_: any, i: number) => i !== qIdx);
              setNewItem({ ...newItem, metadata: { ...newItem.metadata, questions: updated } });
            }}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter your question here..."
          value={q.question_text}
          onChange={(e) => {
            const updated = [...newItem.metadata.questions];
            updated[qIdx].question_text = e.target.value;
            setNewItem({ ...newItem, metadata: { ...newItem.metadata, questions: updated } });
          }}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['A', 'B', 'C', 'D'].map((optLabel, optIdx) => (
            <div key={optIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${qIdx}`}
                checked={q.correct_answer === q.options[optIdx] && q.options[optIdx] !== ''}
                onChange={() => {
                  const updated = [...newItem.metadata.questions];
                  updated[qIdx].correct_answer = q.options[optIdx];
                  setNewItem({ ...newItem, metadata: { ...newItem.metadata, questions: updated } });
                }}
                className="accent-purple-500 w-4 h-4"
                disabled={q.options[optIdx] === ''}
              />
              <input
                type="text"
                placeholder={`Option ${optLabel}`}
                value={q.options[optIdx]}
                onChange={(e) => {
                  const updated = [...newItem.metadata.questions];
                  const oldVal = updated[qIdx].options[optIdx];
                  updated[qIdx].options[optIdx] = e.target.value;
                  // If this was the correct answer, update the correct answer string too
                  if (updated[qIdx].correct_answer === oldVal) {
                    updated[qIdx].correct_answer = e.target.value;
                  }
                  setNewItem({ ...newItem, metadata: { ...newItem.metadata, questions: updated } });
                }}
                className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Explanation (optional, shown after submission)"
          value={q.explanation || ''}
          onChange={(e) => {
            const updated = [...newItem.metadata.questions];
            updated[qIdx].explanation = e.target.value;
            setNewItem({ ...newItem, metadata: { ...newItem.metadata, questions: updated } });
          }}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
        />
      </div>
    ))}
    <button
      onClick={() => {
        const newQ = {
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: '',
          explanation: ''
        };
        setNewItem({
          ...newItem,
          metadata: { ...newItem.metadata, questions: [...newItem.metadata.questions, newQ] }
        });
      }}
      className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded text-sm font-bold text-purple-400 transition"
    >
      + Add Question
    </button>
  </div>
)}

                          <button onClick={handleAddItem} className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition">
                            ✓ Add Item
                          </button>
                        </div>
                      )}

                      {lessonItems.length === 0 ? (
                        <p className="text-gray-500 text-xs text-center py-4">No items yet. Add videos, quizzes, links, or files.</p>
                      ) : (
                        <div className="space-y-2">
                          {lessonItems.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-black/30 border border-gray-700 rounded">
                              <span className="text-2xl">{getItemIcon(item.item_type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-white truncate">{item.title}</p>
                                <p className="text-xs text-gray-500 capitalize">{item.item_type}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-xs transition"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}