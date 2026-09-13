import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/project/ProjectCard';
import CreateProjectModal from '../components/project/CreateProjectModal';
import { Briefcase, Plus, Search, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Projects' },
  { id: 'web', label: 'Web Dev' },
  { id: 'ai-ml', label: 'AI & ML' },
  { id: 'mobile', label: 'Mobile Apps' },
  { id: 'iot', label: 'IoT & Embedded' },
  { id: 'blockchain', label: 'Web3 & Blockchain' },
  { id: 'devops', label: 'Cloud & DevOps' },
];

const ProjectsPage = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category]);

  const handleProjectDeleted = (id) => {
    setProjects(projects.filter((p) => p._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header (Card 10) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-blue-600" /> Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showcase your projects with GitHub and live demo links.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              category === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Projects List (Card 10) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onProjectDeleted={handleProjectDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 space-y-3 shadow-sm">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No projects found</h3>
          <p className="text-xs text-slate-500">Be the first student to showcase a project!</p>
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />
    </div>
  );
};

export default ProjectsPage;
