import React, { useState } from 'react';
import Layout from './components/Layout';
import PhotoMagic from './components/PhotoMagic';
import StoryCreator from './components/StoryCreator';
import ColoringBook from './components/ColoringBook';
import StickersPuzzles from './components/StickersPuzzles';
import { AppView } from './types';

const Home: React.FC<{ 
  setView: (view: AppView) => void
}> = ({ setView }) => {
  return (
    <div className="space-y-24 animate-fade-in pb-12 pt-8">
      {/* Hero Section */}
      <div className="text-center space-y-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm mb-4 animate-bounce-slow">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm bg-emerald-500 text-white">
                Free Magic Studio
            </span>
            <span className="text-sm font-bold text-slate-600">
                100% Free • No Payment Required
            </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-slate-900 drop-shadow-sm leading-tight tracking-tight font-fantasy">
          Magic For <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-500">Everyone</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
          Transform your child's photos into magical adventures. <br className="hidden md:block"/>
          Powered by Gemini Flash AI. Private, safe, and completely free.
        </p>

        <div className="pt-6 flex justify-center space-x-4">
            <button 
                onClick={() => setView(AppView.PHOTO_MAGIC)}
                className="group relative px-10 py-5 bg-slate-900 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1 overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center">
                    Start Creating <span className="ml-2 group-hover:translate-x-1 transition-transform">✨</span>
                </span>
            </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4">
        {[
            { view: AppView.PHOTO_MAGIC, title: "Photo Magic", desc: "Meet characters in real life with Flash AI", icon: "✨", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { view: AppView.STORY_CREATOR, title: "Storybooks", desc: "Star in your own free adventure book", icon: "📚", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", border: "border-amber-100" },
            { view: AppView.COLORING_BOOK, title: "Coloring", desc: "Turn any photo into free printable pages", icon: "🎨", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50", border: "border-pink-100" },
            { view: AppView.PUZZLES, title: "Fun Zone", desc: "Create free stickers and puzzles", icon: "🧩", gradient: "from-indigo-400 to-purple-500", bg: "bg-indigo-50", border: "border-indigo-100" }
        ].map((feature, idx) => (
            <div 
                key={idx}
                onClick={() => setView(feature.view)}
                className={`group glass-card rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer relative overflow-hidden border ${feature.border}`}
            >
                 <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 bg-gradient-to-br ${feature.gradient} -mr-10 -mt-10 transition-opacity duration-500`}></div>
                 
                 <div className="flex justify-between items-start mb-8">
                   <div className={`w-20 h-20 rounded-3xl ${feature.bg} flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                       {feature.icon}
                   </div>
                 </div>
                 
                 <h3 className="text-2xl font-bold text-slate-800 mb-3 font-fantasy tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${feature.gradient} transition-all">
                    {feature.title}
                 </h3>
                 <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                 
                 <div className="mt-10 flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                        Ready to Use
                     </span>
                     <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-gradient-to-r ${feature.gradient} group-hover:text-white transition-all shadow-sm`}>
                        →
                     </div>
                 </div>
            </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home setView={setCurrentView} />;
      case AppView.PHOTO_MAGIC:
        return <PhotoMagic />;
      case AppView.STORY_CREATOR:
        return <StoryCreator />;
      case AppView.COLORING_BOOK:
        return <ColoringBook />;
      case AppView.PUZZLES:
        return <StickersPuzzles />;
      default:
        return <Home setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;