import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import ProjectCard from '../components/project/ProjectCard';
import EditProfileModal from './EditProfileModal';
import toast from 'react-hot-toast';
import {
  User,
  GraduationCap,
  Calendar,
  MapPin,
  Globe,
  Edit3,
  UserPlus,
  UserCheck,
  Loader2,
  FileText,
  Briefcase,
  Info,
  Shield,
  MessageCircle
} from 'lucide-react';
import { Github, Linkedin } from '../components/common/Icons';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateFollowingCount } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'projects', 'about'
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const isOwnProfile = currentUser && currentUser.username === username;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${username}`);
      if (res.data.success) {
        const u = res.data.user;
        setProfileUser(u);
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(u.followersCount || 0);

        // Fetch user posts and projects
        const [postsRes, projectsRes] = await Promise.all([
          api.get(`/users/${u._id}/posts`),
          api.get(`/users/${u._id}/projects`),
        ]);

        if (postsRes.data.success) setPosts(postsRes.data.posts || []);
        if (projectsRes.data.success) setProjects(projectsRes.data.projects || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow students.');
      return;
    }
    if (followLoading) return;

    try {
      setFollowLoading(true);
      if (isFollowing) {
        const res = await api.delete(`/users/${profileUser._id}/follow`);
        setIsFollowing(false);
        if (res.data?.targetFollowersCount !== undefined) {
          setFollowersCount(res.data.targetFollowersCount);
        } else {
          setFollowersCount((prev) => Math.max(0, prev - 1));
        }
        if (res.data?.currentFollowingCount !== undefined) {
          updateFollowingCount(res.data.currentFollowingCount);
        }
        toast.success(`Unfollowed @${profileUser.username}`);
      } else {
        const res = await api.post(`/users/${profileUser._id}/follow`);
        setIsFollowing(true);
        if (res.data?.targetFollowersCount !== undefined) {
          setFollowersCount(res.data.targetFollowersCount);
        } else {
          setFollowersCount((prev) => prev + 1);
        }
        if (res.data?.currentFollowingCount !== undefined) {
          updateFollowingCount(res.data.currentFollowingCount);
        }
        toast.success(`Following @${profileUser.username}! 🎉`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Student Profile Not Found</h2>
        <Link to="/" className="text-indigo-400 text-xs mt-2 inline-block hover:underline">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card (Card 5) */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover banner */}
        <div className="h-44 sm:h-52 bg-slate-200 relative overflow-hidden">
          <img
            src={
              profileUser.coverImage ||
              'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop'
            }
            alt="Campus Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              <img
                src={
                  profileUser.avatar ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop'
                }
                alt={profileUser.fullName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white shadow-xl bg-white"
              />
              {profileUser.role === 'admin' && (
                <span className="absolute bottom-1 right-1 p-1.5 rounded-full bg-amber-500 text-white shadow">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-sm transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/messages/${profileUser._id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-sm transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Message</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Name & Handle */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profileUser.fullName}</h1>
              <p className="text-xs text-blue-600 font-semibold">@{profileUser.username}</p>
            </div>

            {/* Department */}
            <p className="text-xs font-bold text-slate-700">
              {profileUser.department || 'Computer Science Engineering'}
            </p>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {profileUser.bio || 'Passionate about technology | Learn | Build | Grow'}
            </p>

            {/* Department / College / Year */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              {profileUser.college && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {profileUser.college}
                </span>
              )}
              {profileUser.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {profileUser.year} Year
                </span>
              )}
            </div>

            {/* Social Links */}
            {(profileUser.github || profileUser.linkedin || profileUser.website) && (
              <div className="flex items-center gap-3 pt-1">
                {profileUser.github && (
                  <a
                    href={profileUser.github.startsWith('http') ? profileUser.github : `https://github.com/${profileUser.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-slate-900 transition"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profileUser.linkedin && (
                  <a
                    href={profileUser.linkedin.startsWith('http') ? profileUser.linkedin : `https://linkedin.com/in/${profileUser.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-blue-600 transition"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profileUser.website && (
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-blue-600 transition"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Followers / Following counts (Card 5 exact format: 42 Posts | 316 Followers | 280 Following) */}
            <div className="flex items-center gap-8 pt-4 border-t border-slate-100 text-xs">
              <div>
                <strong className="text-slate-900 font-extrabold mr-1 text-sm">
                  {posts.length || profileUser.postsCount || 0}
                </strong>
                <span className="text-slate-500 font-medium">Posts</span>
              </div>
              <div>
                <strong className="text-slate-900 font-extrabold mr-1 text-sm">
                  {isOwnProfile ? (currentUser?.followersCount ?? followersCount) : followersCount}
                </strong>
                <span className="text-slate-500 font-medium">Followers</span>
              </div>
              <div>
                <strong className="text-slate-900 font-extrabold mr-1 text-sm">
                  {isOwnProfile ? (currentUser?.followingCount ?? profileUser.followingCount ?? 0) : (profileUser.followingCount ?? 0)}
                </strong>
                <span className="text-slate-500 font-medium">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row (Card 5: Posts | Projects | About) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'about'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((p) => (
              <PostCard
                key={p._id}
                post={p}
                onPostDeleted={(id) => setPosts(posts.filter((item) => item._id !== id))}
              />
            ))
          ) : (
            <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-xs text-slate-500">No posts shared by this student yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map((proj) => (
              <ProjectCard
                key={proj._id}
                project={proj}
                onProjectDeleted={(id) => setProjects(projects.filter((p) => p._id !== id))}
              />
            ))
          ) : (
            <div className="col-span-2 py-12 text-center rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-xs text-slate-500">No showcase projects published yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs text-slate-700 leading-relaxed">
          <h3 className="font-bold text-sm text-slate-900">Student Background</h3>
          <p>
            {profileUser.bio || 'Passionate about technology | Learn | Build | Grow'}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-slate-400 block font-semibold">Department:</span>
              <span className="font-bold text-slate-900">{profileUser.department || 'Computer Science Engineering'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">College:</span>
              <span className="font-bold text-slate-900">{profileUser.college || 'National Institute of Technology'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Academic Year:</span>
              <span className="font-bold text-slate-900">{profileUser.year || '4th'} Year</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Joined CampusConnect:</span>
              <span className="font-bold text-slate-900">
                {new Date(profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdated={(u) => setProfileUser(u)}
      />
    </div>
  );
};

export default ProfilePage;
