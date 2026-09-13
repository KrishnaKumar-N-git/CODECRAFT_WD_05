const Project = require('../models/Project');
const Like = require('../models/Like');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { deleteFromCloudinary } = require('../middleware/upload');

const enrichWithLikes = async (projects, userId) => {
  if (!userId || !projects.length) return projects.map(p => ({ ...p.toObject(), isLiked: false }));
  const ids = projects.map(p => p._id);
  const likes = await Like.find({ user: userId, targetId: { $in: ids }, targetType: 'Project' });
  const likedSet = new Set(likes.map(l => l.targetId.toString()));
  return projects.map(p => ({ ...p.toObject(), isLiked: likedSet.has(p._id.toString()) }));
};

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const query = { isDeleted: false };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const projects = await Project.find(query)
      .populate('author', 'username fullName avatar department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);
    const enriched = await enrichWithLikes(projects, req.user?._id);

    res.json({ success: true, projects: enriched, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false })
      .populate('author', 'username fullName avatar department college skills');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user._id, targetId: project._id, targetType: 'Project' });
      isLiked = !!like;
    }

    res.json({ success: true, project: { ...project.toObject(), isLiked } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description, technologies, category, githubUrl, demoUrl } = req.body;

    const projectData = {
      author: req.user._id, title, description,
      technologies: Array.isArray(technologies) ? technologies : technologies?.split(',').map(t => t.trim()) || [],
      category: category || 'other',
      githubUrl: githubUrl || '', demoUrl: demoUrl || '',
    };

    if (req.file) {
      projectData.image = req.file.path;
      projectData.imagePublicId = req.file.filename;
    }

    const project = await Project.create(projectData);
    await User.findByIdAndUpdate(req.user._id, { $inc: { projectsCount: 1 } });

    const populated = await Project.findById(project._id).populate('author', 'username fullName avatar');
    res.status(201).json({ success: true, project: { ...populated.toObject(), isLiked: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.isDeleted) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    project.isDeleted = true;
    await project.save();
    if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
    await User.findByIdAndUpdate(project.author, { $inc: { projectsCount: -1 } });

    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects/:id/like  &  DELETE /api/projects/:id/like
const toggleLikeProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const existing = await Like.findOne({ user: req.user._id, targetId: project._id, targetType: 'Project' });

    if (existing) {
      await Like.findByIdAndDelete(existing._id);
      await Project.findByIdAndUpdate(project._id, { $inc: { likesCount: -1 } });
      return res.json({ success: true, isLiked: false, likesCount: Math.max(0, project.likesCount - 1) });
    }

    await Like.create({ user: req.user._id, targetId: project._id, targetType: 'Project' });
    await Project.findByIdAndUpdate(project._id, { $inc: { likesCount: 1 } });

    if (project.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: project.author,
        sender: req.user._id,
        type: 'like_project',
        referenceModel: 'Project',
        referenceId: project._id,
        message: `${req.user.fullName} liked your project "${project.title}".`,
      });
    }

    res.json({ success: true, isLiked: true, likesCount: project.likesCount + 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjects, getProject, createProject, deleteProject, toggleLikeProject };
