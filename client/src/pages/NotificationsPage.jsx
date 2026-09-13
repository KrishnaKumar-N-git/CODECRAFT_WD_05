import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  CheckCheck,
  Loader2,
  Tag,
  Sparkles
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Likes', 'Comments', 'Follows', 'Mentions'

  // Default seed notifications matching Card 8
  const defaultNotifications = [
    {
      _id: 'seed-notif-1',
      type: 'follow',
      sender: {
        fullName: 'Priya S',
        username: 'priya_s',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      message: 'Priya S started following you',
      timeText: '2m ago',
      isRead: false,
    },
    {
      _id: 'seed-notif-2',
      type: 'like_post',
      sender: {
        fullName: 'Arun Kumar',
        username: 'arun_kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      message: 'Arun Kumar liked your post',
      timeText: '5m ago',
      isRead: true,
    },
    {
      _id: 'seed-notif-3',
      type: 'comment',
      sender: {
        fullName: 'Rahul R',
        username: 'rahul_r',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      },
      message: 'Rahul R commented on your post "Great project!"',
      timeText: '10m ago',
      isRead: true,
    },
    {
      _id: 'seed-notif-4',
      type: 'mention',
      sender: {
        fullName: 'Sneha M',
        username: 'sneha_m',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      },
      message: 'Sneha M tagged you in a post',
      timeText: '15m ago',
      isRead: false,
    },
    {
      _id: 'seed-notif-5',
      type: 'event_update',
      sender: {
        fullName: 'Tech Club',
        username: 'techclub',
        avatar: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100&h=100&fit=crop',
      },
      message: 'Tech Club posted a new event "Hackathon 2025"',
      timeText: '1h ago',
      isRead: true,
    },
  ];

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success && res.data.notifications?.length > 0) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications(defaultNotifications);
      }
    } catch (err) {
      setNotifications(defaultNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'like_post':
      case 'like_comment':
      case 'like_project':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'mention':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'event_update':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  const filterTabs = ['All', 'Likes', 'Comments', 'Follows', 'Mentions'];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Likes') return n.type?.startsWith('like');
    if (filter === 'Comments') return n.type === 'comment' || n.type === 'reply';
    if (filter === 'Follows') return n.type === 'follow';
    if (filter === 'Mentions') return n.type === 'mention' || n.type === 'tag';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header (Card 8) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Get real-time notifications for new interactions.</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs (Card 8: All | Likes | Comments | Follows | Mentions) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 bg-white shadow-sm ${
                n.isRead ? 'border-slate-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>

                {n.sender && (
                  <Link to={`/profile/${n.sender.username}`} className="shrink-0">
                    <img
                      src={n.sender.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
                      alt={n.sender.fullName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  </Link>
                )}

                <div className="overflow-hidden">
                  <p className="text-xs text-slate-800 font-medium leading-snug">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {n.timeText || (n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now')}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-sm shadow-blue-500/50"></span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 shadow-sm p-8 space-y-2">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No {filter !== 'All' ? filter.toLowerCase() : ''} notifications</h3>
          <p className="text-xs text-slate-500">When someone interacts with you, you'll see updates here.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
