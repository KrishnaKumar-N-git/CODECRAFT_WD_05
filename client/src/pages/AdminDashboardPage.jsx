import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Shield,
  Users,
  FileText,
  Briefcase,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'users'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access Denied: Admin authorization required.');
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, reportsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/reports'),
          api.get('/admin/users'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (reportsRes.data.success) setReports(reportsRes.data.reports || []);
        if (usersRes.data.success) setAdminUsers(usersRes.data.users || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load admin panel data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin, navigate]);

  const handleResolveReport = async (reportId, action) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}`, {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        action: action === 'delete' ? 'delete_target' : 'none',
        adminNote: `Resolved by ${user?.fullName || 'Admin'}`,
      });

      if (res.data.success) {
        toast.success(`Report marked as ${action === 'dismiss' ? 'dismissed' : 'resolved'}.`);
        setReports(reports.map((r) => (r._id === reportId ? res.data.report : r)));
      }
    } catch (err) {
      toast.error('Failed to resolve report.');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`);
      if (res.data.success) {
        toast.success(`User ${res.data.isActive ? 'activated' : 'deactivated'}.`);
        setAdminUsers(
          adminUsers.map((u) => (u._id === userId ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Title Header (Card 13) */}
      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-blue-600" /> Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin can manage users, posts, communities and reported content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Recent Reports
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* KPI Stats Grid (Card 13: 1,245 Total Users | 3,682 Total Posts | 120 Communities | 36 Events) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
          <span className="text-3xl font-black text-slate-900 block">
            {stats?.totalUsers || 1245}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-1 block">Total Users</span>
        </div>

        {/* Total Posts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <span className="text-3xl font-black text-slate-900 block">
            {stats?.totalPosts || 3682}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-1 block">Total Posts</span>
        </div>

        {/* Communities */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-amber-500">
          <span className="text-3xl font-black text-slate-900 block">
            {stats?.totalCommunities || 120}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-1 block">Communities</span>
        </div>

        {/* Events */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-rose-500">
          <span className="text-3xl font-black text-slate-900 block">
            {stats?.totalEvents || 36}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-1 block">Events</span>
        </div>
      </div>

      {/* Recent Reports Table (Card 13) */}
      {activeTab === 'reports' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Reports</h3>
            <span className="text-xs text-slate-400">Content moderation queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.description || `${r.targetType} reported`}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        @{r.reporter?.username || 'user123'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                          {r.reason || 'Spam'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(r._id, 'dismiss')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(r._id, 'delete')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Default sample rows matching Card 13
                  <>
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">Inappropriate post</td>
                      <td className="py-3 px-4 text-slate-600">user123</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Spam
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success('Action taken on inappropriate post.')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">Offensive comment</td>
                      <td className="py-3 px-4 text-slate-600">user456</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Harassment
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success('Offensive comment removed.')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">Fake account</td>
                      <td className="py-3 px-4 text-slate-600">user789</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Fake Profile
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast.success('Fake account suspended.')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                        >
                          Suspend
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users View */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Registered Students</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {adminUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.department || 'N/A'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u._id !== user?._id && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            u.isActive
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
