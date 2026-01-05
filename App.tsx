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
    <div className="space-y-32 animate-fade-in pb-20">
      {/* Masterpiece Hero Section */}
      <div className="text-center space-y-10 relative mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-100/30 rounded-full blur-[140px] -z-10"></div>
        
        <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-rose-100 shadow-xl shadow-rose-900/5 mb-4 animate-float">
            <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white"></div>
            </div>
            <span className="text-sm font-bold text-slate-700 tracking-tight">
                Now featuring <span className="text-rose-600">Gemini 2.5 Flash</span> Magic
            </span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-bold text-slate-900 drop-shadow-sm leading-[0.9] tracking-tighter font-fantasy">
          Magic For The <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-red-600 to-amber-500">Next Gen</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed px-4">
          Transform childhood moments into high-definition digital keepsakes. 
          The world's most accessible AI playground for families.
        </p>

        <div className="pt-8 flex justify-center items-center">
            <button 
                onClick={() => setView(AppView.PHOTO_MAGIC)}
                className="group relative px-14 py-6 bg-slate-900 text-white text-2xl font-bold rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(225,29,72,0.4)] transition-all hover:-translate-y-2 active:scale-95 overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center">
                    Enter the Studio <span className="ml-3 group-hover:translate-x-2 transition-transform">✨</span>
                </span>
            </button>
        </div>
      </div>

      {/* Feature Hall of Magic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-5xl mx-auto">
        {[
            { 
              view: AppView.PHOTO_MAGIC, 
              title: "The Photo Studio", 
              desc: "Hyper-realistic character encounters with perfect identity matching.", 
              icon: "🪄", 
              accent: "✨ NEW"
            },
            { 
              view: AppView.STORY_CREATOR, 
              title: "Legend Library", 
              desc: "Generate full children's books with your child as the star on every page.", 
              icon: "📚", 
              accent: "🏺 BESTSELLER"
            },
            { 
              view: AppView.COLORING_BOOK, 
              title: "Atelier Art", 
              desc: "Convert memories into stunning, high-contrast coloring collections.", 
              icon: "🎨", 
              accent: "🖋️ CREATIVE"
            },
            { 
              view: AppView.PUZZLES, 
              title: "Fun Pavilion", 
              desc: "Custom stickers, puzzle games, and AI-driven play zones.", 
              icon: "🧩", 
              accent: "💠 PLAY"
            }
        ].map((feature, idx) => (
            <div 
                key={idx}
                onClick={() => setView(feature.view)}
                className="group glass-card rounded-[3rem] p-10 transition-all cursor-pointer relative overflow-hidden flex flex-col items-start text-left"
            >
                 <div className="flex justify-between w-full items-start mb-8">
                   <div className={`w-20 h-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}>
                       {feature.icon}
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-3 py-1.5 rounded-full tracking-widest uppercase">{feature.accent}</span>
                 </div>
                 
                 <h3 className="text-3xl font-bold text-slate-800 mb-3 font-fantasy tracking-wide group-hover:text-rose-700 transition-colors">
                    {feature.title}
                 </h3>
                 <p className="text-slate-500 font-medium leading-relaxed text-lg">{feature.desc}</p>
                 
                 <div className="mt-10 flex items-center justify-between w-full">
                     <span className="text-sm font-bold text-slate-400 group-hover:text-slate-800 transition-colors flex items-center">
                        Explore Area <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                     </span>
                     <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                     </div>
                 </div>
                 
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
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