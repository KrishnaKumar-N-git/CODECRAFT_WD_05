import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Image,
  Video,
  UserCheck,
  Send,
  Loader2,
  Trash2,
  Globe
} from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, defaultCommunityId = null, initialFile = null }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [community, setCommunity] = useState(defaultCommunityId || '');
  const [communities, setCommunities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagField, setShowTagField] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/communities?limit=50')
        .then((res) => {
          if (res.data.success) {
            setCommunities(res.data.communities || []);
          }
        })
        .catch(() => {});

      if (initialFile) {
        const isVideo = initialFile.type.startsWith('video/');
        setMediaFiles([initialFile]);
        setMediaPreviews([{
          url: URL.createObjectURL(initialFile),
          type: isVideo ? 'video' : 'image',
          name: initialFile.name,
        }]);
      }
    } else {
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setTagInput('');
      setShowTagField(false);
    }
  }, [isOpen, initialFile]);

  if (!isOpen) return null;

  const handleFileChange = (e, isVideo = false) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 4) {
      toast.error('Maximum 4 media attachments allowed.');
      return;
    }

    const newFiles = [...mediaFiles, ...files];
    setMediaFiles(newFiles);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') || isVideo ? 'video' : 'image',
      name: file.name,
    }));
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Write some text or attach a photo/video.');
      return;
    }

    try {
      setSubmitting(true);
      let finalContent = content.trim();
      if (tagInput.trim()) {
        finalContent += (finalContent ? ' ' : '') + tagInput.trim();
      }
      const formData = new FormData();
      formData.append('content', finalContent);
      if (community) {
        formData.append('community', community);
      }
      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Post published to campus feed! 🎉');
        setContent('');
        setMediaFiles([]);
        setMediaPreviews([]);
        onClose();
        if (onPostCreated) onPostCreated(res.data.post);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Card 4) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Create Post</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Post Content Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Sharing moments from our college fest! 🎆"
            rows={4}
            maxLength={2000}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />

          {/* Tag People Input toggle */}
          {showTagField && (
            <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-800">Tag Friends:</span>
              <input
                type="text"
                placeholder="e.g. @krishnakumar @arun"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 bg-transparent text-xs text-blue-950 placeholder-blue-400 focus:outline-none"
              />
            </div>
          )}

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  {preview.type === 'video' ? (
                    <video src={preview.url} className="w-full h-32 object-cover" controls />
                  ) : (
                    <img src={preview.url} alt="upload" className="w-full h-32 object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons: [Add Photo] [Add Video] [Tag People] (Card 4) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Image className="w-4 h-4 text-emerald-600" />
              <span>Add Photo</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Video className="w-4 h-4 text-blue-600" />
              <span>Add Video</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTagField(!showTagField)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Tag People</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, false)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => handleFileChange(e, true)}
            accept="video/*"
            className="hidden"
          />

          {/* Footer (Card 4): Post to [Public v] and [Post] blue button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span>Post to:</span>
              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="">Public</option>
                {communities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || (!content.trim() && mediaFiles.length === 0)}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
