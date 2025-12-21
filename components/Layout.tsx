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
    { label: 'Photo Magic', view: AppView.PHOTO_MAGIC, icon: '✨' },
    { label: 'Stories', view: AppView.STORY_CREATOR, icon: '📚' },
    { label: 'Coloring', view: AppView.COLORING_BOOK, icon: '🎨' },
    { label: 'Fun Zone', view: AppView.PUZZLES, icon: '🧩' },
  ];

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-purple-50 to-amber-50 text-slate-800 font-sans selection:bg-purple-200">
      
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-200/20 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-200/20 blur-[120px]"></div>
          <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl shadow-xl shadow-indigo-900/5 px-6 border border-white/60">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => setView(AppView.HOME)}>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform mr-3">
                 <span className="text-xl">✨</span>
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-slate-800 font-fantasy tracking-wide group-hover:text-emerald-600 transition-colors hidden sm:block">
                  Photo Magic Kids
                </h1>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 sm:hidden">
                  PMK
                </h1>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    currentView === item.view
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                      : 'text-slate-500 hover:bg-white/60 hover:text-emerald-600'
                  }`}
                >
                  <span className="mr-2 opacity-90">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>

            {/* Right Side Status */}
            <div className="flex items-center space-x-2 pl-4 border-l border-slate-100">
               <div className="flex items-center space-x-2 px-4 py-2 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm text-sm font-bold">
                   <span className="mr-2">🔓</span>
                   <span className="hidden sm:inline">Magic Unlocked</span>
               </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Nav Bar */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 glass-panel rounded-2xl shadow-2xl flex justify-around p-3 z-50 border border-white/80 backdrop-blur-xl">
            {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === item.view ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-400'}`}
                >
                    <span className="text-xl mb-0.5 relative">{item.icon}</span>
                    <span className="text-[10px] font-bold">{item.label}</span>
                </button>
            ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 md:pb-12 relative z-10">
        {children}
      </main>
      
      <footer className="hidden md:block text-center py-10 text-slate-400 text-sm relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-3">
           <span className="h-px w-12 bg-emerald-200"></span>
           <span className="font-fantasy text-emerald-600/60 text-lg">Magic Studio</span>
           <span className="h-px w-12 bg-emerald-200"></span>
        </div>
        <p className="opacity-60 font-medium tracking-wide">Secure • Private • Free Creative Studio</p>
      </footer>
    </div>
  );
};

export default Layout;