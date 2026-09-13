import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import ProjectCard from '../components/project/ProjectCard';
import EventCard from '../components/event/EventCard';
import CommunityCard from '../components/community/CommunityCard';
import {
  Compass,
  TrendingUp,
  Users,
  FileText,
  Briefcase,
  Calendar,
  Loader2,
  ArrowRight,
  MessageCircle,
  Heart
} from 'lucide-react';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'trending';
  const [activeTab, setActiveTab] = useState(initialTab); // 'trending', 'users', 'posts', 'projects', 'events'
  const [loading, setLoading] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);

  // Card 12 Top Trending Topics
  const trendingTopics = [
    {
      rank: 1,
      title: 'AI in Education',
      likes: 245,
      comments: 63,
      tag: 'technology',
      summary: 'Students discussing Gemini and Deep Learning integrations into academic curricula.',
    },
    {
      rank: 2,
      title: 'College Fest 2025',
      likes: 198,
      comments: 52,
      tag: 'events',
      summary: 'Inter-collegiate cultural & robotics fest scheduled for next month at Main Auditorium.',
    },
    {
      rank: 3,
      title: 'Best Laptops for Students',
      likes: 176,
      comments: 41,
      tag: 'guidance',
      summary: 'Senior student recommendations on M3 MacBooks vs ThinkPads for coding and ML projects.',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'trending') {
          const [pRes, prRes] = await Promise.all([
            api.get('/posts/trending'),
            api.get('/projects?limit=4'),
          ]);
          if (pRes.data.success) setPosts(pRes.data.posts || []);
          if (prRes.data.success) setProjects(prRes.data.projects || []);
        } else if (activeTab === 'users') {
          const res = await api.get('/users?limit=16');
          if (res.data.success) setUsers(res.data.users || []);
        } else if (activeTab === 'posts') {
          const res = await api.get('/posts/feed?limit=10');
          if (res.data.success) setPosts(res.data.posts || []);
        } else if (activeTab === 'projects') {
          const res = await api.get('/projects?limit=10');
          if (res.data.success) setProjects(res.data.projects || []);
        } else if (activeTab === 'events') {
          const res = await api.get('/events?limit=10');
          if (res.data.success) setEvents(res.data.events || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Header (Card 12) */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Compass className="w-7 h-7 text-blue-600" /> Explore / Trending
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Explore trending Posts, projects and events.
        </p>
      </div>

      {/* Tabs (Card 12: Trending | Users | Posts | Projects | Events) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* 1. Trending Tab (Card 12 Numbered List) */}
          {activeTab === 'trending' && (
            <div className="space-y-6">
              {/* Numbered Ranked Topics (Card 12: 1, 2, 3) */}
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.rank}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Dark circle with number */}
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {topic.rank}
                      </div>

                      <div className="overflow-hidden">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {topic.likes} likes • {topic.comments} comments
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/search?q=${encodeURIComponent(topic.title)}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>

              {/* Trending Posts */}
              {posts.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-sm text-slate-900">Trending Discussions</h3>
                  {posts.map((p) => (
                    <PostCard key={p._id} post={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Users Tab */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
                      alt={u.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200 group-hover:scale-105 transition"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {u.fullName}
                      </h4>
                      <p className="text-xs text-blue-600 font-semibold truncate">@{u.username}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.department}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {u.bio || 'Computer Science student at CampusConnect.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      <strong className="text-slate-900 font-bold">{u.followersCount || 0}</strong> followers
                    </span>

                    <Link
                      to={`/profile/${u.username}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          )}

          {/* 4. Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.map((proj) => (
                <ProjectCard key={proj._id} project={proj} />
              ))}
            </div>
          )}

          {/* 5. Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {events.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExplorePage;
