
const normalizeMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Flag,
  Smile,
  Loader2,
  Check
} from 'lucide-react';

const PostCard = ({ post, onPostDeleted }) => {
  const { user, isAuthenticated, isAdmin, updateFollowingCount } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Heart pop animation for double click
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  // Comments state
  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentInputRef = useRef(null);

  // Menu and Report state
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Follow state for the author
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isAuthor = user && post.author && (user._id === post.author._id || user._id === post.author);
  const canDelete = isAuthor || isAdmin;

  // Initial comment load
  useEffect(() => {
    let isMounted = true;
    api.get(`/comments?post=${post._id}`)
      .then((res) => {
        if (isMounted && res.data.success) {
          setComments(res.data.comments || []);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [post._id]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts.');
      return;
    }
    if (likeLoading) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      setLikeLoading(true);
      if (prevLiked) {
        await api.delete(`/posts/${post._id}/like`);
      } else {
        await api.post(`/posts/${post._id}/like`);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to update like.');
    } finally {
      setLikeLoading(false);
    }
  };

  // Double tap to like (Signature Instagram feature!)
  const handleMediaDoubleClick = () => {
    if (!isLiked) {
      handleToggleLike();
    }
    setShowHeartOverlay(true);
    setTimeout(() => {
      setShowHeartOverlay(false);
    }, 800);
  };

  const handleToggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (nextState) {
      toast.success('Post saved to your collection! 🔖');
    } else {
      toast.success('Post removed from saved collection.');
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow students.');
      return;
    }
    const authorId = post.author?._id || post.author;
    if (!authorId) return;

    try {
      setFollowLoading(true);
      const nextFollow = !isFollowing;
      setIsFollowing(nextFollow);
      if (nextFollow) {
        const res = await api.post(`/users/${authorId}/follow`);
        if (res.data?.currentFollowingCount !== undefined) {
          updateFollowingCount(res.data.currentFollowingCount);
        }
        toast.success(`Following @${post.author?.username || 'student'}!`);
      } else {
        const res = await api.delete(`/users/${authorId}/follow`);
        if (res.data?.currentFollowingCount !== undefined) {
          updateFollowingCount(res.data.currentFollowingCount);
        }
        toast.success(`Unfollowed @${post.author?.username || 'student'}.`);
      }
    } catch (err) {
      setIsFollowing(!isFollowing);
      toast.error('Could not update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to comment.');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post('/comments', {
        post: post._id,
        content: newComment.trim(),
      });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setCommentsCount((prev) => prev + 1);
        setNewComment('');
        toast.success('Comment posted! 💬');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1));
        toast.success('Comment deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        toast.success('Post deleted.');
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      toast.error('Failed to delete post.');
    }
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to report content.');
      return;
    }
    try {
      setSubmittingReport(true);
      const res = await api.post('/reports', {
        targetType: 'Post',
        targetId: post._id,
        reason: reportReason,
        description: reportDescription,
      });
      if (res.data.success) {
        toast.success('Report submitted to campus moderators.');
        setShowReportModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed`;
    navigator.clipboard.writeText(url);
    toast.success('Post link copied to clipboard! 📋');
  };

  const addEmoji = (emoji) => {
    setNewComment((prev) => prev + emoji);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : '2h ago';

  const authorUsername = post.author?.username || 'student';
  const authorName = post.author?.fullName || 'Student';
  const authorAvatar =
    post.author?.avatar ||
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop';
  const authorDept = post.author?.department || 'Campus Student';

  // Display comments: if collapsed, show last 2; if expanded, show all
  const displayedComments = showAllComments ? comments : comments.slice(-2);

  return (
    <article className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 mb-6">
      {/* 1. Header (Instagram Style) */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with Instagram Gradient Ring */}
          <Link to={`/profile/${authorUsername}`} className="relative shrink-0 group">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-600 transition group-hover:scale-105">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            </div>
          </Link>

          {/* User Info */}
          <div className="overflow-hidden leading-tight">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${authorUsername}`}
                className="font-bold text-sm text-slate-900 hover:text-blue-600 transition truncate"
              >
                {authorUsername}
              </Link>
              {!isAuthor && isAuthenticated && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`text-xs font-bold transition cursor-pointer ${
                      isFollowing
                        ? 'text-slate-500 hover:text-rose-600'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {authorDept}
            </p>
          </div>
        </div>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in"
              onClick={() => setShowMenu(false)}
            >
              {canDelete && (
                <button
                  onClick={handleDeletePost}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              )}
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Copy Post Link</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 text-left cursor-pointer"
              >
                <Flag className="w-4 h-4 text-amber-500" />
                <span>Report to Campus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Media (Full width edge-to-edge with double-click like!) */}
      {post.media && post.media.length > 0 ? (
        <div
          className="relative w-full bg-slate-900 select-none overflow-hidden cursor-pointer flex items-center justify-center min-h-[300px] max-h-[580px]"
          onDoubleClick={handleMediaDoubleClick}
        >
          {post.media[0].type === 'video' ? (
            <video
              src={normalizeMediaUrl(post.media[0].url)}
              controls
              className="w-full max-h-[580px] object-contain"
            />
          ) : (
            <img
              src={normalizeMediaUrl(post.media[0].url)}
              alt="Campus Post"
              className="w-full max-h-[580px] object-cover"
              loading="lazy"
            />
          )}

          {/* Double Click Heart Overlay Animation */}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="animate-ping duration-300">
                <Heart className="w-24 h-24 text-white fill-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 3. Action Buttons Row (Heart, MessageCircle, Send, Bookmark) */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            onClick={handleToggleLike}
            className="hover:opacity-70 transition cursor-pointer transform active:scale-125"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-800'
              }`}
            />
          </button>

          {/* Comment button */}
          <button
            onClick={() => commentInputRef.current?.focus()}
            className="hover:opacity-70 transition cursor-pointer"
            title="Comment"
          >
            <MessageCircle className="w-6 h-6 -rotate-90 text-slate-800" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="hover:opacity-70 transition cursor-pointer"
            title="Share"
          >
            <Send className="w-5 h-5 text-slate-800" />
          </button>
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleToggleBookmark}
          className="hover:opacity-70 transition cursor-pointer transform active:scale-125"
          title={isBookmarked ? 'Saved' : 'Save'}
        >
          <Bookmark
            className={`w-6 h-6 transition-colors ${
              isBookmarked ? 'fill-slate-900 text-slate-900' : 'text-slate-800'
            }`}
          />
        </button>
      </div>

      {/* 4. Likes Count (Instagram Style) */}
      <div className="px-4 py-1">
        <p className="text-xs font-bold text-slate-900">
          {likesCount === 0 ? (
            'Be the first to like this'
          ) : likesCount === 1 ? (
            '1 like'
          ) : (
            <>
              Liked by <span className="font-extrabold">arun_kumar</span> and{' '}
              <span className="font-extrabold">{likesCount - 1} others</span>
            </>
          )}
        </p>
      </div>

      {/* 5. Caption & Tags (Instagram Style: **username** caption) */}
      <div className="px-4 py-1 text-xs text-slate-900 leading-relaxed">
        <Link
          to={`/profile/${authorUsername}`}
          className="font-bold mr-2 hover:underline"
        >
          {authorUsername}
        </Link>
        <span className="whitespace-pre-line text-slate-800">{post.content}</span>

        {/* Tagged Friends */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {post.tags.map((t) => (
              <Link
                key={t._id || t}
                to={`/profile/${t.username || t}`}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                @{t.username || 'student'}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 6. Comments Section (Instagram Style) */}
      <div className="px-4 py-1 space-y-1">
        {comments.length > 2 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium block pt-0.5 cursor-pointer"
          >
            {showAllComments
              ? 'Hide comments'
              : `View all ${commentsCount} comments`}
          </button>
        )}

        {/* Render comments list */}
        {displayedComments.map((c) => {
          const commentAuthor = c.author;
          const commentUsername = commentAuthor?.username || commentAuthor?.fullName || 'student';
          const canDeleteComment =
            user && (user._id === commentAuthor?._id || user._id === commentAuthor || isAdmin);

          return (
            <div key={c._id} className="flex items-start justify-between text-xs py-0.5 group">
              <div className="flex items-start gap-2">
                <Link
                  to={`/profile/${commentUsername}`}
                  className="font-bold text-slate-900 hover:underline"
                >
                  {commentUsername}
                </Link>
                <span className="text-slate-700">{c.content}</span>
              </div>

              {canDeleteComment && (
                <button
                  onClick={() => handleDeleteComment(c._id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 transition cursor-pointer"
                  title="Delete comment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Timestamp */}
        <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider pt-1">
          {timeAgo}
        </p>
      </div>

      {/* 7. Inline "Add a comment..." Bar (Instagram Style) */}
      <div className="border-t border-slate-100 mt-2 px-4 py-2.5">
        {/* Quick Emojis */}
        <div className="flex items-center gap-2 mb-1.5">
          {['❤️', '🔥', '👏', '🎓', '🎉'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-sm hover:scale-125 transition cursor-pointer p-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addEmoji('😊')}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            ref={commentInputRef}
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none"
          />

          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Post'}
          </button>
        </form>
      </div>

      {/* 8. Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-500" /> Report Content to Campus Admin
            </h4>
            <form onSubmit={handleReportPost} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500"
                >
                  <option value="spam">Spam or unwanted advertising</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="hate_speech">Hate speech or discrimination</option>
                  <option value="misinformation">Misleading academic information</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details (Optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe why this violates guidelines..."
                  rows={3}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
