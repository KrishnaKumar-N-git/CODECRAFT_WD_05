import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import ProjectCard from '../components/project/ProjectCard';
import CommunityCard from '../components/community/CommunityCard';
import EventCard from '../components/event/EventCard';
import { Search, Users, FileText, Briefcase, Calendar, Loader2 } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
    if (query.trim()) {
      executeSearch(query);
    }
  }, [query]);

  const executeSearch = async (term) => {
    try {
      setLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(term)}&type=all`);
      if (res.data.success) {
        setResults(res.data.results || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const users = results.users || [];
  const posts = results.posts || [];
  const projects = results.projects || [];
  const communities = results.communities || [];
  const events = results.events || [];

  const totalResults = users.length + posts.length + projects.length + communities.length + events.length;

  return (
    <div className="space-y-6">
      {/* Search Header Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-white">Campus Global Search</h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by student name, tech skill, club topic, post keyword..."
            className="w-full pl-11 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Search
          </button>
        </form>

        {query && (
          <p className="text-xs text-slate-400">
            Showing results for <span className="text-indigo-400 font-semibold">"{query}"</span> ({totalResults} found)
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'all', label: `All (${totalResults})` },
          { id: 'users', label: `Students (${users.length})` },
          { id: 'posts', label: `Posts (${posts.length})` },
          { id: 'projects', label: `Projects (${projects.length})` },
          { id: 'communities', label: `Clubs (${communities.length})` },
          { id: 'events', label: `Events (${events.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : totalResults > 0 ? (
        <div className="space-y-8">
          {/* Students Section */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Students ({users.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 truncate">
                          {u.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                        {u.department && (
                          <p className="text-[10px] text-indigo-300 truncate">{u.department}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Posts ({posts.length})
              </h3>
              <div className="space-y-3">
                {posts.map((p) => (
                  <PostCard key={p._id} post={p} />
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {(activeTab === 'all' || activeTab === 'projects') && projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Projects ({projects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <ProjectCard key={proj._id} project={proj} />
                ))}
              </div>
            </div>
          )}

          {/* Communities Section */}
          {(activeTab === 'all' || activeTab === 'communities') && communities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Communities ({communities.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map((c) => (
                  <CommunityCard key={c._id} community={c} />
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {(activeTab === 'all' || activeTab === 'events') && events.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-400" /> Events ({events.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <EventCard key={evt._id} event={evt} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : query ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-8 space-y-2">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No results found</h3>
          <p className="text-xs text-slate-400">Try searching for keywords like "React", "AI", "LeetCode", or student names.</p>
        </div>
      ) : null}
    </div>
  );
};

export default SearchPage;
