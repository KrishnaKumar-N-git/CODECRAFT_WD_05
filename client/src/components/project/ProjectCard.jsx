import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ExternalLink,
  Heart,
  Code2,
  Trash2,
  Tag
} from 'lucide-react';
import { Github } from '../common/Icons';

const ProjectCard = ({ project, onProjectDeleted }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [likesCount, setLikesCount] = useState(project.likesCount || 0);
  const [isLiked, setIsLiked] = useState(project.isLiked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isAuthor = user && project.author && (user._id === project.author._id || user._id === project.author);
  const canDelete = isAuthor || isAdmin;

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like projects.');
      return;
    }
    if (likeLoading) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      setLikeLoading(true);
      const res = await api.post(`/projects/${project._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to like project.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project showcase?')) return;
    try {
      const res = await api.delete(`/projects/${project._id}`);
      if (res.data.success) {
        toast.success('Project deleted.');
        if (onProjectDeleted) onProjectDeleted(project._id);
      }
    } catch (err) {
      toast.error('Failed to delete project.');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/projects`;
    navigator.clipboard.writeText(url);
    toast.success('Project link copied to clipboard! 📋');
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row group">
      {/* Project Image (Card 10 Left) */}
      <div className="sm:w-64 h-48 sm:h-auto shrink-0 relative overflow-hidden bg-slate-100">
        <img
          src={
            project.image ||
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop'
          }
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {canDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition cursor-pointer"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Project Details (Card 10 Right) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
              {project.title}
            </h3>
            {project.author && (
              <Link to={`/profile/${project.author.username}`} className="text-xs text-slate-500 hover:text-blue-600">
                by {project.author.fullName || project.author.username}
              </Link>
            )}
          </div>

          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack Pills: [React] [Node.js] [MongoDB] */}
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar: ❤️ 96  💬 18  ↗️  [GitHub] [Live Demo] */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Likes, Comments & Share */}
          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <span className="flex items-center gap-1.5 text-slate-500">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span>18</span>
            </span>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* GitHub & Live Demo buttons (Card 10) */}
          <div className="flex items-center gap-2">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            ) : (
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}

            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            ) : (
              <a
                href="https://campusconnect-demo.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
