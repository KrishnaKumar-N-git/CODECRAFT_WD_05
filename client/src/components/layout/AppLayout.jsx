import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Rightbar from './Rightbar';
import CreatePostModal from '../post/CreatePostModal';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, PlusSquare, Users, Briefcase, Calendar } from 'lucide-react';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [initialMediaFile, setInitialMediaFile] = useState(null);

  const handleOpenCreatePost = (file = null) => {
    setInitialMediaFile(file);
    setCreatePostOpen(true);
  };

  const handleCloseCreatePost = () => {
    setCreatePostOpen(false);
    setInitialMediaFile(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Sticky Navbar */}
      <Navbar onOpenCreatePost={isAuthenticated ? () => handleOpenCreatePost(null) : null} />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Dynamic Content Area */}
        <main className="flex-1 min-w-0 max-w-3xl mx-auto w-full pb-16 lg:pb-6">
          <Outlet context={{ openCreatePost: handleOpenCreatePost }} />
        </main>

        {/* Right Trending & Recommendations Column */}
        <Rightbar />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2 flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `p-2 flex flex-col items-center gap-1 ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Feed</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `p-2 flex flex-col items-center gap-1 ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </NavLink>

        {isAuthenticated && (
          <button
            onClick={() => setCreatePostOpen(true)}
            className="p-2 -mt-5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center cursor-pointer hover:bg-blue-700"
          >
            <PlusSquare className="w-6 h-6" />
          </button>
        )}

        <NavLink
          to="/communities"
          className={({ isActive }) =>
            `p-2 flex flex-col items-center gap-1 ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clubs</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `p-2 flex flex-col items-center gap-1 ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px]">Projects</span>
        </NavLink>
      </div>

      {/* Global Create Post Modal */}
      <CreatePostModal
        isOpen={createPostOpen}
        initialFile={initialMediaFile}
        onClose={handleCloseCreatePost}
        onPostCreated={() => {
          // Trigger custom event so feeds can prepend newly created post
          window.dispatchEvent(new Event('post:created'));
        }}
      />
    </div>
  );
};

export default AppLayout;
