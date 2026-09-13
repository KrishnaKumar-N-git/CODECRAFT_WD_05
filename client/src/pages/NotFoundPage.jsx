import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center">
        <Compass className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-4xl font-black text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The campus page, student profile, or project showcase you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Campus Feed</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
