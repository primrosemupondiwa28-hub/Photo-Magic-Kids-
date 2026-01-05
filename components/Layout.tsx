import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navItems = [
    { label: 'Home', view: AppView.HOME, icon: '🏰' },
    { label: 'Studio', view: AppView.PHOTO_MAGIC, icon: '✨' },
    { label: 'Library', view: AppView.STORY_CREATOR, icon: '📚' },
    { label: 'Atelier', view: AppView.COLORING_BOOK, icon: '🎨' },
    { label: 'Play', view: AppView.PUZZLES, icon: '🧩' },
  ];

  return (
    <div className="min-h-screen relative selection:bg-rose-100">
      
      {/* Dynamic Background Blobs */}
      <div className="magic-blob w-[500px] h-[500px] bg-rose-100 top-[-10%] left-[-10%]"></div>
      <div className="magic-blob w-[600px] h-[600px] bg-amber-50 bottom-[-10%] right-[-10%]" style={{ animationDuration: '45s' }}></div>
      <div className="magic-blob w-[400px] h-[400px] bg-red-50 top-[30%] right-[15%]" style={{ animationDelay: '-10s' }}></div>

      {/* Navbar */}
      <nav className="sticky top-6 z-50 max-w-6xl mx-auto px-4">
        <div className="glass-panel rounded-[2rem] shadow-2xl px-8 py-4 flex justify-between items-center border border-white">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setView(AppView.HOME)}>
            <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white p-3 rounded-[1.25rem] shadow-xl shadow-rose-200/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
               <span className="text-2xl">🪄</span>
            </div>
            <div className="hidden sm:block">
               <h1 className="text-2xl font-bold text-slate-800 font-fantasy tracking-tight group-hover:text-rose-700 transition-colors">
                Magic Kids
              </h1>
              <span className="text-[10px] font-bold text-rose-600/60 uppercase tracking-[0.2em] leading-none">The Original Studio</span>
            </div>
          </div>
          
          {/* Nav Items */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/40 p-1.5 rounded-2xl border border-slate-200/40">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  currentView === item.view
                    ? 'bg-white text-rose-700 shadow-md border border-rose-50'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'
                }`}
              >
                <span className="mr-2 text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
             <div className="text-right hidden sm:block">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Studio Access</p>
               <p className="text-sm font-bold text-rose-600">Premium Active</p>
             </div>
             <div className="w-11 h-11 rounded-[1rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl shadow-inner border border-white">
                👦
             </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex justify-around p-2 glass-panel rounded-[1.5rem] shadow-xl border border-white">
            {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex flex-col items-center p-3 rounded-2xl transition-all ${currentView === item.view ? 'text-rose-700 bg-rose-50' : 'text-slate-400'}`}
                >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
                </button>
            ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10 min-h-screen">
        {children}
      </main>
      
      <footer className="max-w-6xl mx-auto px-8 py-20 text-center border-t border-rose-50 mt-20">
        <div className="flex flex-col items-center space-y-6">
           <div className="flex items-center space-x-4">
             <div className="h-px w-12 bg-rose-100"></div>
             <h3 className="font-fantasy text-3xl text-rose-800/20">Magic Kids Studio</h3>
             <div className="h-px w-12 bg-rose-100"></div>
           </div>
           <p className="text-slate-400 text-sm font-medium tracking-wide max-w-md mx-auto leading-relaxed">
             Crafting magical digital experiences for the next generation. 
             Safe, high-performance, and powered by advanced Gemini AI.
           </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;