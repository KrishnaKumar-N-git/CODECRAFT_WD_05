import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, UserPlus, Check, Calendar, ExternalLink } from 'lucide-react';

const Rightbar = () => {
  const { user: currentUser, isAuthenticated, updateFollowingCount } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [followingMap, setFollowingMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const [usersRes, followingRes] = await Promise.all([
          api.get('/users?limit=6'),
          currentUser ? api.get(`/users/${currentUser._id}/following`).catch(() => null) : null,
        ]);

        if (usersRes?.data?.success) {
          const peers = (usersRes.data.users || []).filter(
            (u) => !currentUser || u._id !== currentUser._id
          );
          setUsers(peers);
        }

        if (followingRes?.data?.success) {
          const map = {};
          (followingRes.data.users || []).forEach((u) => {
            map[u._id] = true;
          });
          setFollowingMap(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeers();
  }, [currentUser]);

  const handleToggleFollow = async (userId, username) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow students.');
      return;
    }

    const isFollowing = !!followingMap[userId];
    // Optimistic toggle
    setFollowingMap((prev) => ({ ...prev, [userId]: !isFollowing }));

    try {
      if (isFollowing) {
        const res = await api.delete(`/users/${userId}/follow`);
        toast.success(`Unfollowed @${username}`);
        if (res.data?.currentFollowingCount !== undefined) {
          updateFollowingCount(res.data.currentFollowingCount);
        }
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, followersCount: res.data?.targetFollowersCount ?? Math.max(0, (u.followersCount || 1) - 1) }
              : u
          )
        );
      } else {
        const res = await api.post(`/users/${userId}/follow`);
        toast.success(`Following @${username}! 🎉`);
        if (res.data?.currentFollowingCount !== undefined) {
          updateFollowingCount(res.data.currentFollowingCount);
        }
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, followersCount: res.data?.targetFollowersCount ?? ((u.followersCount || 0) + 1) }
              : u
          )
        );
      }
    } catch (err) {
      if (err.response?.data?.message === 'Already following.') {
        setFollowingMap((prev) => ({ ...prev, [userId]: true }));
        toast.success(`You are following @${username}`);
      } else {
        // Revert
        setFollowingMap((prev) => ({ ...prev, [userId]: isFollowing }));
        toast.error(err.response?.data?.message || 'Failed to update follow.');
      }
    }
  };

  const filteredUsers = users.filter((u) =>
    search ? u.fullName.toLowerCase().includes(search.toLowerCase()) || u.department.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <aside className="w-80 shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pl-2 space-y-4">
      {/* Current User Micro Row (Instagram Style) */}
      {isAuthenticated && currentUser && (
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <Link to={`/profile/${currentUser.username}`} className="flex items-center gap-3 min-w-0 group">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
              alt={currentUser.fullName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20 group-hover:scale-105 transition"
            />
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                {currentUser.username}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {currentUser.fullName}
              </p>
            </div>
          </Link>
          <Link
            to={`/profile/${currentUser.username}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0 ml-2"
          >
            Profile
          </Link>
        </div>
      )}

      {/* Card 7: Follow Users / Suggested for you (Instagram Style) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested for you</h3>
          <Link to="/explore" className="text-xs font-bold text-slate-900 hover:text-blue-600">
            See All
          </Link>
        </div>

        {/* Search users input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Users List */}
        <div className="space-y-3 pt-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => {
              const isFollowing = !!followingMap[u._id];
              return (
                <div key={u._id} className="flex items-center justify-between gap-2">
                  <Link to={`/profile/${u.username}`} className="flex items-center gap-2.5 min-w-0 group">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
                      alt={u.fullName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {u.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">@{u.username}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.department}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleToggleFollow(u._id, u.username)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 py-2 text-center">No matching students found.</p>
          )}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="text-[11px] text-slate-400 px-2 space-y-1">
        <p>© 2026 CampusConnect Platform</p>
        <div className="flex gap-2 text-blue-600">
          <Link to="/about" className="hover:underline">About</Link>
          <span>•</span>
          <Link to="/explore" className="hover:underline">Explore</Link>
          <span>•</span>
          <Link to="/communities" className="hover:underline">Clubs</Link>
        </div>
      </div>
    </aside>
  );
};

export default Rightbar;
