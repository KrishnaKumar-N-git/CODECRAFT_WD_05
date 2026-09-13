import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import ProjectCard from '../components/project/ProjectCard';
import CommunityCard from '../components/community/CommunityCard';
import { TrendingUp, Sparkles, Briefcase, Users, Loader2 } from 'lucide-react';

const TrendingPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await api.get('/search/trending');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border border-purple-500/20 shadow-lg">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
          Campus Buzz
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-indigo-400" /> Trending On Campus
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Discover the most viral student posts, highly-rated technical projects, and active discussion clubs right now.
        </p>
      </div>

      {/* Trending Posts */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" /> Top Discussions
        </h2>
        {data?.trendingPosts?.length > 0 ? (
          <div className="space-y-3">
            {data.trendingPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No trending posts in the last 24 hours.</p>
        )}
      </div>

      {/* Trending Projects */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" /> Starred Student Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.trendingProjects?.map((proj) => (
            <ProjectCard key={proj._id} project={proj} />
          ))}
        </div>
      </div>

      {/* Top Communities */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" /> Most Active Communities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.popularCommunities?.map((c) => (
            <CommunityCard key={c._id} community={c} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
