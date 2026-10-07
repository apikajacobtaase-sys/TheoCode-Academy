'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useToast } from '@/components/Toast';

interface Discussion {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  replies?: Discussion[];
}

export default function DiscussionForum({ lessonId }: { lessonId: string }) {
  const { isSignedIn, user } = useUser();
  const { showToast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, [lessonId]);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions`);
      const data = await res.json();
      setDiscussions(data.discussions || []);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        showToast('success', '💬 Comment posted!', 3000);
        setNewComment('');
        fetchDiscussions();
      }
    } catch {
      showToast('error', 'Failed to post comment', 3000);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parent_id: parentId })
      });

      if (res.ok) {
        showToast('success', '💬 Reply posted!', 3000);
        setReplyContent('');
        setReplyingTo(null);
        fetchDiscussions();
      }
    } catch {
      showToast('error', 'Failed to post reply', 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400 animate-pulse">Loading discussions...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        💬 Discussion ({discussions.length})
      </h3>

      {/* Post new comment */}
      {isSignedIn ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            rows={3}
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg text-sm font-bold transition"
          >
            Post Comment
          </button>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 mb-2">Sign in to join the discussion</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      {/* Discussions list */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No discussions yet. Be the first to post!</p>
        ) : (
          discussions.map((d) => (
            <div key={d.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {d.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{d.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{d.content}</p>
                  
                  {isSignedIn && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === d.id ? null : d.id)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      {replyingTo === d.id ? 'Cancel' : '↩ Reply'}
                    </button>
                  )}

                  {/* Replies */}
                  {d.replies && d.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-gray-700 pl-4">
                      {d.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                            {r.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-white text-sm">{r.username}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(r.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === d.id && (
                    <div className="mt-3">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={2}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                      />
                      <button
                        onClick={() => handleReply(d.id)}
                        disabled={!replyContent.trim()}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded text-xs font-bold transition"
                      >
                        Post Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}