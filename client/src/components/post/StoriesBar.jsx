import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Image,
  Video,
  Send,
  Loader2,
  Clock
} from 'lucide-react';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours validity

const INITIAL_STORIES = [
  {
    id: 's1',
    user: 'Your Story',
    username: 'krishnakumar',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=900&fit=crop',
    title: 'Study Session @ Central Library 📚',
    isOwn: true,
    hasActiveStory: false,
    duration: 15, // 15 seconds
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString(),
  },
  {
    id: 's2',
    user: 'Priya S',
    username: 'priya_s',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=900&fit=crop',
    title: 'Sunset over Main Campus Lawn 🌅',
    isLive: true,
    hasActiveStory: true,
    duration: 15,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's3',
    user: 'Tech Fest',
    username: 'techfest',
    avatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=900&fit=crop',
    title: 'Auditorium Stage Lights Soundcheck! 🎸',
    hasActiveStory: true,
    duration: 15,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's4',
    user: 'Arun Kumar',
    username: 'arun_kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=900&fit=crop',
    title: 'Merged my full-stack MERN pull request! 🚀',
    hasActiveStory: true,
    duration: 15,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's5',
    user: 'Coding Club',
    username: 'codingclub',
    avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=900&fit=crop',
    title: 'Campus Hackathon countdown: 48 Hours left!',
    hasActiveStory: true,
    duration: 15,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's6',
    user: 'Rahul R',
    username: 'rahul_r',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=900&fit=crop',
    title: 'Robotics lab testing new Arduino sensors 🤖',
    hasActiveStory: true,
    duration: 15,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 13 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's7',
    user: 'Sneha M',
    username: 'sneha_m',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=900&fit=crop',
    title: 'Group discussion before Placement Drive 🎓',
    hasActiveStory: true,
    duration: 15,
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
  },
];

const STORY_DURATION_MS = 15000; // 15 seconds per story slide
const TIMER_STEP_MS = 50;

// Filter out stories that are older than 24 hours
const pruneExpiredStories = (list) => {
  const now = Date.now();
  return list
    .map((story) => {
      if (story.isOwn) {
        // If own story has expired (> 24 hours), reset hasActiveStory
        if (
          story.hasActiveStory &&
          story.createdAt &&
          now - new Date(story.createdAt).getTime() >= TWENTY_FOUR_HOURS_MS
        ) {
          return {
            ...story,
            hasActiveStory: false,
            image: null,
            title: 'Add to your story',
          };
        }
        return story;
      }
      return story;
    })
    .filter((story) => {
      if (story.isOwn && !story.hasActiveStory) return true; // Always keep "Your story" trigger visible
      if (!story.createdAt) return true;
      return now - new Date(story.createdAt).getTime() < TWENTY_FOUR_HOURS_MS;
    });
};

const getRemainingTimeStr = (createdAt) => {
  if (!createdAt) return '24h story';
  const remainingMs = Math.max(
    0,
    TWENTY_FOUR_HOURS_MS - (Date.now() - new Date(createdAt).getTime())
  );
  const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  if (remainingHours > 0) return `Expires in ${remainingHours}h`;
  if (remainingMinutes > 0) return `Expires in ${remainingMinutes}m`;
  return 'Expiring soon';
};

const StoriesBar = () => {
  const { user, isAuthenticated } = useAuth();
  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('campus_stories_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return pruneExpiredStories(parsed);
      } catch (e) {
        return pruneExpiredStories(INITIAL_STORIES);
      }
    }
    return pruneExpiredStories(INITIAL_STORIES);
  });

  // Modal view state
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isPaused, setIsPaused] = useState(false);

  // Add story upload modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [storyType, setStoryType] = useState('image');
  const [storyCaption, setStoryCaption] = useState('');
  const [uploadingStory, setUploadingStory] = useState(false);

  const fileInputRef = useRef(null);

  // Save stories to local storage
  useEffect(() => {
    localStorage.setItem('campus_stories_v2', JSON.stringify(stories));
  }, [stories]);

  // Periodic pruning of stories older than 24 hours
  useEffect(() => {
    const timer = setInterval(() => {
      setStories((prev) => pruneExpiredStories(prev));
    }, 60000); // check every minute
    return () => clearInterval(timer);
  }, []);

  // 15-Second Timer Loop
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const increment = (TIMER_STEP_MS / STORY_DURATION_MS) * 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          // Time expired (15 seconds reached) -> advance to next story or finish
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((idx) => idx + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + increment;
      });
    }, TIMER_STEP_MS);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories.length]);

  const openStory = (idx) => {
    const target = stories[idx];
    // If clicking own story and has no active story yet, open add modal
    if (target.isOwn && !target.hasActiveStory) {
      handleOpenDeviceUpload();
      return;
    }
    setActiveStoryIndex(idx);
    setProgress(0);
    setIsPaused(false);
  };

  const closeStory = () => {
    setActiveStoryIndex(null);
    setProgress(0);
    setIsPaused(false);
  };

  const nextStory = () => {
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  // Device file input handler for camera/gallery upload
  const handleOpenDeviceUpload = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to post a campus story.');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeviceFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setStoryFile(file);
    setStoryType(isVideo ? 'video' : 'image');
    setStoryPreview(URL.createObjectURL(file));
    setShowAddModal(true);
    e.target.value = null; // reset
  };

  const handlePublishStory = (e) => {
    e.preventDefault();
    if (!storyPreview) {
      toast.error('Please select an image or video from your device.');
      return;
    }

    setUploadingStory(true);
    setTimeout(() => {
      const newOwnStory = {
        id: 's_own_' + Date.now(),
        user: user?.fullName || 'Your Story',
        username: user?.username || 'you',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
        image: storyPreview,
        mediaType: storyType,
        title: storyCaption.trim() || 'Campus Moments 🎓',
        isOwn: true,
        hasActiveStory: true,
        duration: 15,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString(),
      };

      // Replace or update own story at front
      setStories((prev) => [
        newOwnStory,
        ...prev.filter((s) => !s.isOwn),
      ]);

      setUploadingStory(false);
      setShowAddModal(false);
      setStoryFile(null);
      setStoryPreview(null);
      setStoryCaption('');
      toast.success('Your story was published! Valid for 24 hours (1 day) ⏱️');
    }, 400);
  };

  return (
    <>
      {/* Hidden native device file picker for phone/laptop camera or gallery */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDeviceFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Instagram Stories Carousel */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm mb-4">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-1">
          {stories.map((story, idx) => {
            const avatarSrc = story.isOwn && user?.avatar ? user.avatar : story.avatar;
            const displayName = story.isOwn ? 'Your story' : story.user;
            const hasRing = !story.isOwn || story.hasActiveStory;

            return (
              <div
                key={story.id}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                <div className="relative">
                  {/* Story ring button */}
                  <button
                    onClick={() => openStory(idx)}
                    className="cursor-pointer block focus:outline-none"
                    title={story.isOwn && !story.hasActiveStory ? 'Add to your story' : `Watch ${story.user}'s story (Valid 24h)`}
                  >
                    <div
                      className={`p-[2.5px] rounded-full transition-transform group-hover:scale-105 ${
                        hasRing
                          ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-600 shadow-sm shadow-rose-500/20'
                          : 'bg-slate-200'
                      }`}
                    >
                      <div className="p-0.5 bg-white rounded-full">
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </button>

                  {/* Add icon for Own Story (Device Upload Trigger) */}
                  {story.isOwn && (
                    <button
                      onClick={handleOpenDeviceUpload}
                      className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow transition cursor-pointer"
                      title="Upload photo/video from phone or laptop (Valid 24 hours)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {story.isLive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md ring-2 ring-white">
                      LIVE
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-medium text-slate-700 max-w-[70px] truncate text-center group-hover:text-blue-600 transition">
                  {displayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 15-SECOND STORY VIEW MODAL (WITH 24-HOUR EXPIRATION BADGE) */}
      {activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in select-none">
          {/* Close button */}
          <button
            onClick={closeStory}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-30"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Pause / Play indicator */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-30"
            title={isPaused ? 'Resume (15s timer)' : 'Pause'}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Desktop Left / Right Navigation Controls */}
          {activeStoryIndex > 0 && (
            <button
              onClick={prevStory}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer hidden sm:block z-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {activeStoryIndex < stories.length - 1 && (
            <button
              onClick={nextStory}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer hidden sm:block z-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Story Container (15 seconds per slide with holding pause) */}
          <div
            className="relative w-full max-w-sm h-[85vh] max-h-[720px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Story Media */}
            {stories[activeStoryIndex].mediaType === 'video' ? (
              <video
                src={stories[activeStoryIndex].image}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={stories[activeStoryIndex].image}
                alt="Story Content"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none"></div>

            {/* Click zones for mobile / quick tapping: left 30% goes back, right 30% goes forward */}
            <div
              className="absolute top-16 left-0 w-1/3 bottom-24 z-20 cursor-pointer"
              onClick={prevStory}
            />
            <div
              className="absolute top-16 right-0 w-1/3 bottom-24 z-20 cursor-pointer"
              onClick={nextStory}
            />

            {/* Top Bar: Progress Bars (15s animated) + User Info + 24H Validity Badge */}
            <div className="relative z-30 p-4 space-y-3">
              {/* Progress bars (Instagram 15-second timer) */}
              <div className="flex items-center gap-1.5 w-full">
                {stories.map((_, i) => {
                  let widthStyle = '0%';
                  if (i < activeStoryIndex) widthStyle = '100%';
                  else if (i === activeStoryIndex) widthStyle = `${progress}%`;

                  return (
                    <div
                      key={i}
                      className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear"
                        style={{ width: widthStyle }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* User row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={stories[activeStoryIndex].avatar}
                    alt={stories[activeStoryIndex].user}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <span className="text-white text-xs font-bold block leading-none">
                      {stories[activeStoryIndex].user}
                    </span>
                    <span className="text-white/70 text-[10px] mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400 inline" />
                      {getRemainingTimeStr(stories[activeStoryIndex].createdAt)} • 15s per view
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-sm">
                  {Math.ceil((15 * (100 - progress)) / 100)}s
                </span>
              </div>
            </div>

            {/* Bottom Caption & Reply Bar */}
            <div className="relative z-30 p-5 space-y-3">
              <p className="text-white text-sm font-semibold leading-snug drop-shadow-md">
                {stories[activeStoryIndex].title}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder={`Reply to ${stories[activeStoryIndex].user}...`}
                  className="flex-1 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 text-xs focus:outline-none focus:bg-white/30 backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success(`Message sent to ${stories[activeStoryIndex].user}! ✈️`);
                    nextStory();
                  }}
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE STORY MODAL (From phone/laptop device upload, Valid 24 hours) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Add to Campus Story (Valid 24h)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Preview */}
            <form onSubmit={handlePublishStory} className="p-6 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-72 aspect-[4/5] mx-auto flex items-center justify-center shadow-inner relative">
                {storyType === 'video' ? (
                  <video src={storyPreview} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={storyPreview} alt="Device upload" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Valid for 24 Hours • 15s</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Story Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Study grind at library / hackathon vibe 🚀"
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleOpenDeviceUpload}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Choose Different File
                </button>

                <button
                  type="submit"
                  disabled={uploadingStory}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2"
                >
                  {uploadingStory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Share Story (24h)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBar;
