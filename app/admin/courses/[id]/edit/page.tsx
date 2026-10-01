'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// 🎯 HELPER 1: Automatically converts ANY video link to a working embed link
const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {}
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url; // Returns .mp4 or other direct links as-is
};

// 🎯 HELPER 2: Checks if the link is a direct video file
const isDirectVideo = (url: string) => {
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');
};

export default function CourseEditorPage() {
  const { id: courseId } = useParams();
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editMode, setEditMode] = useState<'module' | 'item'>('module');
  // 🎯 Notify all enrolled users about new content
  const notifyEnrolledUsers = async (title: string, message: string, type: string, link: string) => {
    try {
      // Fetch all enrolled users for this course
      const enrollRes = await fetch(`/api/courses/${courseId}/enrollments`);
      if (!enrollRes.ok) return;
      
      const enrollData = await enrollRes.json();
      const enrolledUsers = enrollData.enrollments || [];
      
      // Send notification to each user
      for (const enrollment of enrolledUsers) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: enrollment.user_id,
            title,
            message,
            type,
            link
          })
        });
      }
    } catch (error) {
      console.error('Failed to notify users:', error);
      // Don't show error to admin - notification is a background task
    }
  };
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    item_type: 'reading',
    content_text: '',
    content_url: '',
    video_duration: ''
  });

  useEffect(() => {
    if (courseId) fetchCourseAndModules();
  }, [courseId]);

  useEffect(() => {
    if (selectedModuleId) fetchItems(selectedModuleId);
  }, [selectedModuleId]);

  const fetchCourseAndModules = async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/admin/courses/${courseId}/modules`)
      ]);
      if (courseRes.ok) setCourse((await courseRes.json()).course);
      if (modulesRes.ok) {
        const data = await modulesRes.json();
        setModules(data.modules || []);
        if (data.modules?.length > 0 && !selectedModuleId) {
          setSelectedModuleId(data.modules[0].id);
          setModuleForm({ title: data.modules[0].title || '', description: data.modules[0].description || '' });
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const selectModule = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      setSelectedModuleId(moduleId);
      setSelectedItemId(null);
      setEditMode('module');
      setModuleForm({ title: mod.title || '', description: mod.description || '' });
      setShowPreview(false);
    }
  };

  const selectItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedItemId(itemId);
      setEditMode('item');
      setItemForm({
        title: item.title || '',
        description: item.description || '',
        item_type: item.item_type || 'reading',
        content_text: item.content_text || '',
        content_url: item.content_url || '',
        video_duration: item.video_duration?.toString() || ''
      });
      setShowPreview(false);
    }
  };
  const handleAddModule = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Module' })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchCourseAndModules();
        setSelectedModuleId(data.module.id);
        setModuleForm({ title: 'New Module', description: '' });
        setEditMode('module');
        setSelectedItemId(null);
        showMessage('success', 'Module added!');
      }
    } catch (error) {
      showMessage('error', 'Failed to add module');
    }
  };
 
  const handleAddItem = async () => {
    if (!selectedModuleId) {
      showMessage('error', 'Please select a module first');
      return;
    }
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${selectedModuleId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Lesson', item_type: 'reading' })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchItems(selectedModuleId);
        selectItem(data.item.id);
        showMessage('success', 'Lesson added!');
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        showMessage('error', err.error || `Failed to add lesson (${res.status})`);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to add lesson');
    }
  };

   const handleSaveModule = async () => {
    if (!selectedModuleId) return;
    if (!moduleForm.title.trim()) {
      showMessage('error', 'Module title is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${selectedModuleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleForm)
      });
      if (res.ok) {
        await fetchCourseAndModules();
        showMessage('success', 'Module saved!');
        
        // 🎯 Notify all enrolled users about the new content
        notifyEnrolledUsers(
          `📚 New content in "${course.title}"`,
          `The module "${moduleForm.title}" has been updated with fresh content.`,
          'content_update',
          `/courses/${courseId}`
        );
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

   const handleSaveItem = async () => {
    if (!selectedItemId || !selectedModuleId) return;
    if (!itemForm.title.trim()) {
      showMessage('error', 'Lesson title is required');
      return;
    }
    setSaving(true);
    try {
      const finalContentUrl = getEmbedUrl(itemForm.content_url);

      const res = await fetch(`/api/admin/courses/${courseId}/modules/${selectedModuleId}/items/${selectedItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          content_url: finalContentUrl,
          video_duration: itemForm.video_duration ? parseInt(itemForm.video_duration) : null
        })
      });
      
      if (res.ok) {
        await fetchItems(selectedModuleId);
        showMessage('success', 'Lesson saved!');
        
        // 🎯 Notify enrolled users about the new lesson
        notifyEnrolledUsers(
          `🎥 New lesson in "${course.title}"`,
          `"${itemForm.title}" has been added. Start learning now!`,
          'new_lesson',
          `/courses/${courseId}/lessons/${selectedItemId}`
        );
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!selectedModuleId) return;
    if (!confirm('Delete this module and ALL its lessons? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${selectedModuleId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCourseAndModules();
        setSelectedModuleId(null);
        setSelectedItemId(null);
        setItems([]);
        showMessage('success', 'Module deleted');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItemId || !selectedModuleId) return;
    if (!confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${selectedModuleId}/items/${selectedItemId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchItems(selectedModuleId);
        setSelectedItemId(null);
        showMessage('success', 'Lesson deleted');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-green-400 animate-pulse text-xl">Loading editor...</div></div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <Link href="/admin/courses" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">← Back to Courses</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-16 z-30">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/courses" className="text-green-400 hover:text-green-300 transition text-sm flex-shrink-0">← Courses</Link>
            <span className="text-gray-600">|</span>
            <h1 className="text-lg font-bold truncate">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {message && (
              <span className={`text-sm px-3 py-1 rounded-lg ${message.type === 'success' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-red-600/20 text-red-400 border border-red-500/30'}`}>
                {message.text}
              </span>
            )}
            <button
              onClick={editMode === 'module' ? handleSaveModule : handleSaveItem}
              disabled={saving}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition flex items-center gap-2"
            >
              {saving ? 'Saving...' : '💾 Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-128px)]">
        <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">📑 Modules</h2>
            <button onClick={handleAddModule} className="w-7 h-7 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-sm transition" title="Add module">+</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {modules.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs"><div className="text-3xl mb-2">📝</div><p>No modules yet</p></div>
            ) : (
              <div className="space-y-1">
                {modules.map((mod, idx) => (
                  <button key={mod.id} onClick={() => selectModule(mod.id)} className={`w-full text-left p-3 rounded-lg transition ${mod.id === selectedModuleId ? 'bg-green-600/20 border border-green-500/50' : 'hover:bg-gray-800 border border-transparent'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 mt-1 font-mono">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${mod.id === selectedModuleId ? 'text-green-400' : 'text-white'}`}>{mod.title || 'Untitled'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <aside className="w-72 bg-gray-900/50 border-r border-gray-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">📖 Lessons</h2>
            <button onClick={handleAddItem} disabled={!selectedModuleId} className="w-7 h-7 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white font-bold text-sm transition" title="Add lesson">+</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!selectedModuleId ? (
              <div className="text-center py-12 text-gray-400 text-xs"><p>Select a module first</p></div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs"><div className="text-3xl mb-2">📄</div><p>No lessons yet</p><p className="mt-1">Click + to add one</p></div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <button key={item.id} onClick={() => selectItem(item.id)} className={`w-full text-left p-3 rounded-lg transition ${item.id === selectedItemId ? 'bg-purple-600/20 border border-purple-500/50' : 'hover:bg-gray-800 border border-transparent'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{item.item_type === 'video' ? '🎥' : item.item_type === 'reading' ? '📖' : item.item_type === 'quiz' ? '🧠' : '💻'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${item.id === selectedItemId ? 'text-purple-400' : 'text-white'}`}>{item.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.item_type}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto">
          {!selectedModuleId && !selectedItemId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-lg">Select a module or lesson to edit</p>
            </div>
          ) : editMode === 'module' ? (
            <div className="max-w-3xl mx-auto p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div>
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Editing Module</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{moduleForm.title || 'Untitled Module'}</h2>
                </div>
                <button onClick={handleDeleteModule} className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg font-medium text-sm transition">🗑️ Delete Module</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Module Title *</label>
                  <input type="text" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="e.g., Module 1: Introduction to C++" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg font-medium placeholder-gray-500 focus:border-green-500 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Module Description</label>
                  <textarea value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} placeholder="What will students learn in this module?" rows={4} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition resize-none" />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Editing Lesson</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{itemForm.title || 'Untitled Lesson'}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowPreview(!showPreview)} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${showPreview ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                    {showPreview ? '✏️ Edit' : '👁️ Preview'}
                  </button>
                  <button onClick={handleDeleteItem} className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg font-medium text-sm transition">🗑️</button>
                </div>
              </div>

              {showPreview ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-3">{itemForm.title || 'Untitled'}</h2>
                  {itemForm.description && <p className="text-gray-400 mb-6 italic">{itemForm.description}</p>}
                  
                  {/* 🎯 SMART VIDEO RENDERER */}
                  {itemForm.item_type === 'video' && itemForm.content_url ? (
                    isDirectVideo(itemForm.content_url) ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                        <video src={itemForm.content_url} controls className="w-full h-full max-h-[500px]">Your browser does not support the video tag.</video>
                      </div>
                    ) : (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative group">
  <iframe 
    src={itemForm.content_url} 
    className="w-full h-full" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowFullScreen 
    title="Lesson Video"
  />
  {/* 🛡️ Transparent overlay to block YouTube logo clicks */}
  <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-auto cursor-default" />
</div>
                    )
                  ) : itemForm.content_text ? (
                    <div className="prose prose-invert max-w-none"><div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{itemForm.content_text}</div></div>
                  ) : (
                    <div className="text-center py-12 text-gray-500"><div className="text-4xl mb-2">📝</div><p>No content yet</p></div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Lesson Title *</label>
                    <input type="text" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} placeholder="e.g., Introduction to Variables" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg font-medium placeholder-gray-500 focus:border-green-500 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Lesson Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={() => setItemForm({ ...itemForm, item_type: 'reading' })} className={`p-3 rounded-lg border-2 transition ${itemForm.item_type === 'reading' ? 'border-green-500 bg-green-600/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
                        <div className="text-xl mb-1">📖</div><div className="text-xs font-bold text-white">Reading</div>
                      </button>
                      <button type="button" onClick={() => setItemForm({ ...itemForm, item_type: 'video' })} className={`p-3 rounded-lg border-2 transition ${itemForm.item_type === 'video' ? 'border-green-500 bg-green-600/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
                        <div className="text-xl mb-1">🎥</div><div className="text-xs font-bold text-white">Video</div>
                      </button>
                      <button type="button" onClick={() => setItemForm({ ...itemForm, item_type: 'quiz' })} className={`p-3 rounded-lg border-2 transition ${itemForm.item_type === 'quiz' ? 'border-green-500 bg-green-600/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
                        <div className="text-xl mb-1">🧠</div><div className="text-xs font-bold text-white">Quiz</div>
                      </button>
                    </div>
                  </div>
                  {itemForm.item_type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Video URL</label>
                      <input type="url" value={itemForm.content_url} onChange={(e) => setItemForm({ ...itemForm, content_url: e.target.value })} placeholder="Paste ANY YouTube, Vimeo, or .mp4 link here" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition font-mono text-sm" />
                      <p className="text-xs text-gray-500 mt-2">💡 Supports: youtube.com, youtu.be, vimeo.com, and direct .mp4 files</p>
                    </div>
                  )}
                  {(itemForm.item_type === 'reading' || itemForm.item_type === 'quiz') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
                      <textarea value={itemForm.content_text} onChange={(e) => setItemForm({ ...itemForm, content_text: e.target.value })} placeholder="Write your lesson content here..." rows={15} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition font-mono text-sm resize-y" />
                      <p className="text-xs text-gray-500 mt-2">{itemForm.content_text.length} characters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}