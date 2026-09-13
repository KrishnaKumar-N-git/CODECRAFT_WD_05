import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ArrowRight,
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Database,
  Server,
  Layers,
  Heart,
  MessageCircle
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Campus<span className="text-blue-600">Connect</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link to="/" className="text-blue-600">Home</Link>
            <Link to="/explore" className="hover:text-blue-600 transition">Explore</Link>
            <Link to="/communities" className="hover:text-blue-600 transition">Communities</Link>
            <Link to="/projects" className="hover:text-blue-600 transition">Projects</Link>
            <Link to="/events" className="hover:text-blue-600 transition">Events</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/feed"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <span>Go to Campus Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Card 1 in Infographic) */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>A Social & Collaboration Platform for College Students</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Connect with <br />
                <span className="text-blue-600">Your Campus</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Share ideas, showcase projects, join communities and be part of your college network. A real working full-stack platform for students, clubs, and recruiters.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? "/feed" : "/register"}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:scale-[1.02] transition-all"
                >
                  <span>{isAuthenticated ? "Open Campus Feed" : "Get Started"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-sm transition"
                >
                  <span>Explore Network</span>
                </Link>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified College Email
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Academic Project Hub
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Campus Clubs
                </span>
              </div>
            </div>

            {/* Right image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=540&fit=crop"
                  alt="Students collaborating with laptops on campus"
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop"
                      alt="Student"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Krishna Kumar (CSE)</p>
                      <p className="text-[11px] text-slate-500">Shared "Library Management System" 🚀</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    Just Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              CampusConnect — How It Works
            </h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              Connect • Share • Collaborate • Grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Feed */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Social Feed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post technical doubts, campus achievements, images and videos. Like, comment, and tag fellow batchmates.
              </p>
              <Link to="/feed" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                View Feed <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Communities */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Student Communities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join Computer Science, Placement Prep, Coding Club, and Design chapters with live member tracking.
              </p>
              <Link to="/communities" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                Browse Clubs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Projects */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Project Showcase</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publish capstone and hackathon projects with live preview URLs, GitHub repositories, and tech stack tags.
              </p>
              <Link to="/projects" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                View Projects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Events */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Campus Events</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never miss college hackathons, alumni webinars, and workshops. Real-time RSVP with attendee counters.
              </p>
              <Link to="/events" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                See Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Section (Card 14 in Infographic) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700 mb-2">
              System Architecture (Card 14)
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Full-Stack Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered with clean separation of concerns, modern REST APIs, and scalable MongoDB storage.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center items-center">
              {/* User */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">User</h4>
                <p className="text-[11px] text-slate-500">(Web Browser)</p>
              </div>

              {/* Frontend */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-blue-900">Frontend</h4>
                <p className="text-[11px] text-blue-700 font-semibold">React + Vite (Vercel)</p>
              </div>

              {/* Backend */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow">
                  <Server className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-emerald-900">Backend</h4>
                <p className="text-[11px] text-emerald-700 font-semibold">Node.js + Express (Render)</p>
              </div>

              {/* Database & Storage */}
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-purple-900">Database & CDN</h4>
                <p className="text-[11px] text-purple-700 font-semibold">MongoDB Atlas + Cloudinary</p>
              </div>
            </div>

            {/* Checklist from Infographic */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Real working full-stack application
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Hosted on the internet (Vercel + Render)
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Useful for university students
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> All required features implemented
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Modern and responsive UI
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Ready for final year project & viva
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white text-center text-xs text-slate-500 border-t border-slate-200">
        <p>© 2026 CampusConnect — Student Social & Collaboration Platform. Built for Academic Project Viva.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
