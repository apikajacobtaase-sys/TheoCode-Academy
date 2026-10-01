'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import StarRating from './StarRating';

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
}

export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const { user } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: '0.0' });
  const [loading, setLoading] = useState(true);
  
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || { totalReviews: 0, averageRating: '0.0' });
        
        // Check if current user has reviewed
        if (user) {
          const userReview = data.reviews?.find((r: any) => r.user_id === user.id);
          if (userReview) {
            setUserHasReviewed(true);
            setUserRating(userReview.rating);
            setUserComment(userReview.comment || '');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRating || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: userRating, comment: userComment })
      });

      if (res.ok) {
        setUserHasReviewed(true);
        fetchReviews(); // Refresh
        setUserComment('');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Delete your review?')) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, { method: 'DELETE' });
      if (res.ok) {
        setUserHasReviewed(false);
        setUserRating(0);
        setUserComment('');
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-20 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      
      {/* Header with Average Rating */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            ⭐ Reviews & Ratings
          </h2>
          <p className="text-gray-400 text-sm">
            {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
        
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-yellow-400">
              {stats.averageRating}
            </div>
            <div>
              <StarRating rating={Math.round(parseFloat(stats.averageRating))} readonly size="sm" />
              <p className="text-xs text-gray-400 mt-1">Average rating</p>
            </div>
          </div>
        )}
      </div>

      {/* Write Review Form (Only for enrolled users) */}
      {user && isEnrolled && (
        <div className="mb-6 p-4 bg-black rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-3">
            {userHasReviewed ? '✏️ Update Your Review' : '✍️ Write a Review'}
          </h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Rating</label>
              <StarRating rating={userRating} onRate={setUserRating} size="lg" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Review (Optional)</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !userRating}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-bold transition"
              >
                {submitting ? 'Submitting...' : userHasReviewed ? 'Update Review' : 'Submit Review'}
              </button>
              
              {userHasReviewed && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Not Enrolled Message */}
      {user && !isEnrolled && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl text-center">
          <p className="text-yellow-400 text-sm">
            🔒 Enroll in this course to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">💬</div>
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-black rounded-xl border border-gray-800">
              <div className="flex items-start gap-3">
                <img
                  src={review.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.full_name || 'U')}&background=16a34a&color=fff&size=200`}
                  alt={review.full_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">
                      {review.full_name || 'Anonymous'}
                    </span>
                    {review.is_name_verified && (
                      <span className="text-green-400 text-sm">✓</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}