import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import CreatePostModal from '../components/post/CreatePostModal';
import toast from 'react-hot-toast';
import { Users, Plus, Check, ArrowLeft, Loader2, MessageSquare, Sparkles } from 'lucide-react';

const CommunityDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const commRes = await api.get(`/communities/${slug}`);
      if (commRes.data.success) {
        const commData = commRes.data.community;
        setCommunity(commData);
        setIsMember(commRes.data.isMember);
        setMembersCount(commData.membersCount || 0);

        // Fetch posts inside community
        const postsRes = await api.get(`/communities/${commData._id}/posts`);
        if (postsRes.data.success) {
          setPosts(postsRes.data.posts || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load community.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [slug]);

  const handleToggleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to join.');
      return;
    }

    try {
      if (isMember) {
        await api.delete(`/communities/${community._id}/leave`);
        setIsMember(false);
        setMembersCount((prev) => Math.max(0, prev - 1));
        toast.success(`Left ${community.name}`);
      } else {
        await api.post(`/communities/${community._id}/join`);
        setIsMember(true);
        setMembersCount((prev) => prev + 1);
        toast.success(`Joined ${community.name}! 🎉`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update membership.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Community Not Found</h2>
        <Link to="/communities" className="text-indigo-400 text-xs mt-2 inline-block hover:underline">
          Return to Communities Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/communities"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all communities
      </Link>

      {/* Community Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={community.avatar || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=160&h=160&fit=crop'}
              alt={community.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0"
            />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 mb-1">
                {community.category || 'Domain Club'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">{community.name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> {membersCount} Members
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {posts.length} Posts
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleJoin}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isMember
                  ? 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {isMember ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Joined
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Join Club
                </>
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setCreatePostOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Post Here
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800/80 leading-relaxed">
          {community.description}
        </p>
      </div>

      {/* Community Posts */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Community Discussion Feed
        </h3>

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(id) => setPosts(posts.filter((p) => p._id !== id))}
            />
          ))
        ) : (
          <div className="py-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No posts in this community yet.</p>
            {isAuthenticated && (
              <button
                onClick={() => setCreatePostOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                Start the first discussion
              </button>
            )}
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        defaultCommunityId={community._id}
        onPostCreated={() => fetchCommunityData()}
      />
    </div>
  );
};

export default CommunityDetailPage;
