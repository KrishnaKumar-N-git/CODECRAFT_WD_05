import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Check, Plus, MessageSquare } from 'lucide-react';

const CommunityCard = ({ community, onStatusChange }) => {
  const { isAuthenticated } = useAuth();
  const [isMember, setIsMember] = useState(community.isMember || false);
  const [membersCount, setMembersCount] = useState(community.membersCount || 0);
  const [loading, setLoading] = useState(false);

  const handleToggleJoin = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to join communities.');
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      if (isMember) {
        const res = await api.delete(`/communities/${community._id}/leave`);
        if (res.data.success) {
          setIsMember(false);
          setMembersCount((prev) => Math.max(0, prev - 1));
          toast.success(`Left ${community.name}`);
          if (onStatusChange) onStatusChange(community._id, false);
        }
      } else {
        const res = await api.post(`/communities/${community._id}/join`);
        if (res.data.success) {
          setIsMember(true);
          setMembersCount((prev) => prev + 1);
          toast.success(`Joined ${community.name}! 🎉`);
          if (onStatusChange) onStatusChange(community._id, true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update membership.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={
            community.avatar ||
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&fit=crop'
          }
          alt={community.name}
          className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 group-hover:scale-105 transition-transform"
        />
        <div className="overflow-hidden">
          <Link
            to={`/communities/${community.slug}`}
            className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition truncate"
          >
            {community.name}
          </Link>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {membersCount >= 1000 ? `${(membersCount / 1000).toFixed(1)}K` : membersCount} members
          </p>
        </div>
      </div>

      <button
        onClick={handleToggleJoin}
        disabled={loading}
        className={`px-5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
          isMember
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
        }`}
      >
        {isMember ? 'Joined' : 'Join'}
      </button>
    </div>
  );
};

export default CommunityCard;
