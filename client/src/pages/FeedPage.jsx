import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import StoriesBar from '../components/post/StoriesBar';
import { Sparkles, TrendingUp, Users, PlusCircle, Loader2, Image, Video, UserCheck, Send } from 'lucide-react';

const FeedPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { openCreatePost } = useOutletContext();
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you', 'trending'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const fetchPosts = async (pageNum = 1, tab = activeTab, replace = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const endpoint = tab === 'trending' ? '/posts/trending' : `/posts/feed?page=${pageNum}&limit=10`;
      const res = await api.get(endpoint);

      if (res.data.success) {
        if (replace || pageNum === 1) {
          setPosts(res.data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(res.data.posts || [])]);
        }
        setHasMore(res.data.pagination?.hasMore || false);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPosts(1, activeTab, true);
  }, [activeTab]);

  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts(1, activeTab, true);
    };
    window.addEventListener('post:created', handlePostCreated);
    return () => window.removeEventListener('post:created', handlePostCreated);
  }, [activeTab]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeTab, false);
  };

  return (
    <div className="space-y-4">
      {/* Instagram Stories Carousel */}
      <StoriesBar />

      {/* Quick Compose Card (Matching Card 3) */}
      {isAuthenticated && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-blue-500/20"
            />
            <button
              onClick={openCreatePost}
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 text-xs font-medium transition cursor-pointer"
            >
              What's on your mind?
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hidden file pickers for camera / local media on laptop or phone */}
              <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) openCreatePost(e.target.files[0]);
                  e.target.value = null;
                }}
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) openCreatePost(e.target.files[0]);
                  e.target.value = null;
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition cursor-pointer"
              >
                <Image className="w-4 h-4 text-emerald-600" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition cursor-pointer"
              >
                <Video className="w-4 h-4 text-blue-600" />
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={() => openCreatePost(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Tag</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openCreatePost}
              className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Feed Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('for-you')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'for-you'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'trending'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trending Today</span>
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading campus updates...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
          ))}

          {activeTab === 'for-you' && hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition cursor-pointer"
              >
                {loadingMore ? 'Loading more posts...' : 'Load Earlier Posts'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 shadow-sm p-8 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No posts to display</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first student to publish something interesting to your college network!
          </p>
          {isAuthenticated && (
            <button
              onClick={openCreatePost}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              Create First Post
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
