import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Compass,
  Users,
  Briefcase,
  Calendar,
  Bell,
  User,
  Shield,
  Layers,
  Sparkles,
  MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { to: '/feed', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    ...(isAuthenticated ? [{ to: '/messages', label: 'Messages', icon: MessageCircle }] : []),
    { to: '/communities', label: 'Communities', icon: Users },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/events', label: 'Events', icon: Calendar },
    ...(isAuthenticated ? [{ to: '/notifications', label: 'Notifications', icon: Bell }] : []),
    ...(isAuthenticated ? [{ to: `/profile/${user?.username || 'krishnakumar'}`, label: 'Profile', icon: User }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: Shield, adminOnly: true }] : []),
  ];

  return (
    <aside className="w-56 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pr-2 space-y-4">
      {/* Navigation List (Matching Card 3) */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${item.adminOnly ? 'text-amber-700 hover:text-amber-800' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Micro Profile Card */}
      {isAuthenticated && user && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">{user.fullName}</h4>
              <p className="text-[11px] text-blue-600 truncate font-semibold">@{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center">
            <div>
              <span className="block text-xs font-extrabold text-slate-900">{user.postsCount || 42}</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Posts</span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-900">{user.followersCount || 316}</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Followers</span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-900">{user.followingCount || 280}</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Following</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
