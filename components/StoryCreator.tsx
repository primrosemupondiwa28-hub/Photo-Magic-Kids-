import React, { useState, useRef, useEffect } from 'react';
import { AgeGroup, StoryPage } from '../types';
import { generateStory, generateIllustration, generateColoringPage, getStoredApiKey } from '../services/gemini';

interface StoryCreatorProps {
    onOpenSettings: () => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ onOpenSettings }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.PRESCHOOL);
  const [theme, setTheme] = useState('');
  const [childDescription, setChildDescription] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [coverStyle, setCoverStyle] = useState<'COLORFUL' | 'COLORING'>('COLORFUL');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<StoryPage[] | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingIllustrations, setLoadingIllustrations] = useState<boolean[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!name || !theme) return;

    if (!getStoredApiKey()) {
        onOpenSettings();
        return;
    }

    setIsGenerating(true);
    setStory(null);
    setStep(3);
    
    try {
      const pages = await generateStory(name, ageGroup, theme);
      setStory(pages);
      setLoadingIllustrations(new Array(pages.length).fill(false));
      generatePageIllustration(0, pages[0].illustrationPrompt, pages);
    } catch (e) {
      console.error(e);
      alert('Failed to create story. Please try again.');
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePageIllustration = async (index: number, prompt: string, currentPages: StoryPage[], forceRegenerate = false) => {
    if (currentPages[index].image && !forceRegenerate) return;

    setLoadingIllustrations(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
    });

    setGenerationProgress(0);
    const interval = setInterval(() => {
        setGenerationProgress(prev => {
            if (prev >= 95) return 95;
            const increment = prev < 50 ? 10 : prev < 80 ? 5 : 1; 
            return prev + increment;
        });
    }, 400);

    try {
        let base64Data: string | undefined = undefined;
        let mimeType: string | undefined = undefined;
        
        if (imagePreview) {
             base64Data = imagePreview.split(',')[1];
             mimeType = imagePreview.split(';')[0].split(':')[1];
        }

        // Enhanced identity anchor specifically demanding cover-to-page consistency
        const identityAnchor = `STRICT CHARACTER CONSISTENCY: This is the MAIN HERO. 
        MATCH PHOTO 100%: Facial structure, eye shape, and nose must match the reference photo exactly.
        HAIR LOCK: The hairstyle MUST be the exact length and texture as the photo. 
        SKIN TONE: ${skinTone || 'Maintain fair/light complexion from photo highlights'}.
        NOTES: ${childDescription}`;

        let image;
        if (index === 0) {
            // Specialized logic for the cover (Page 0)
            const coverLikenessPrompt = `BOOK COVER MASTERPIECE: ${prompt}. The central character MUST have an absolute face match to the provided photo.`;
            
            if (coverStyle === 'COLORING') {
                const coloringPrompt = `COVER COLORING PAGE: ${coverLikenessPrompt}. Bold black outlines, pure white background, ready to be colored.`;
                image = await generateColoringPage(coloringPrompt, base64Data, mimeType, identityAnchor);
            } else {
                const colorfulPrompt = `VIBRANT BOOK COVER: ${coverLikenessPrompt}. Lush colors, magical lighting, professional children's book style.`;
                image = await generateIllustration(colorfulPrompt, base64Data, mimeType, identityAnchor);
            }
        } else {
            // Standard internal story pages
            image = await generateIllustration(prompt, base64Data, mimeType, identityAnchor);
        }
        
        setStory(prev => {
            if (!prev) return null;
            const newPages = [...prev];
            newPages[index] = { ...newPages[index], image };
            return newPages;
        });
    } catch (e) {
        console.error("Illustration failed", e);
        alert("The magic ink ran dry! Try 'Redraw Page'.");
    } finally {
        clearInterval(interval);
        setGenerationProgress(100);
        setTimeout(() => {
            setLoadingIllustrations(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            setGenerationProgress(0);
        }, 500);
    }
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (!story) return;
    const newPage = direction === 'next' 
        ? Math.min(currentPage + 1, story.length - 1)
        : Math.max(currentPage - 1, 0);
    
    setCurrentPage(newPage);
    
    if (!story[newPage].image && !loadingIllustrations[newPage]) {
        generatePageIllustration(newPage, story[newPage].illustrationPrompt, story);
    }
  };
  
  const handleRegenerate = () => {
    if (!story) return;
    const page = story[currentPage];
    generatePageIllustration(currentPage, page.illustrationPrompt, story, true);
  };
  
  const reset = () => {
    setStep(1);
    setStory(null);
    setCurrentPage(0);
    setName('');
    setTheme('');
    setChildDescription('');
    setSkinTone('');
    setCoverStyle('COLORFUL');
    setImageFile(null);
    setImagePreview(null);
  };

  const ageOptions = [
    { type: AgeGroup.TODDLER, icon: '👶', label: 'Toddler (2-3)' },
    { type: AgeGroup.PRESCHOOL, icon: '🧒', label: 'Preschool (4-5)' },
    { type: AgeGroup.EARLY_READER, icon: '📖', label: 'Early Reader (6-8)' },
  ];

  const renderProgressBar = () => (
    <div className="w-64 mt-4">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Painting Masterpiece...</span>
            <span>{generationProgress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
            />
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-slate-800 mb-2 font-fantasy">Storybook Creator 📚</h2>
        <p className="text-slate-500 text-lg">Consistent characters for every adventure.</p>
      </div>

       <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                      step >= s 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' 
                      : 'bg-white text-slate-300 border border-slate-100'
                  }`}>
                      {step > s ? '✓' : s}
                  </div>
                  {s < 3 && (
                      <div className={`w-12 h-1 rounded-full transition-colors duration-300 ${
                          step > s ? 'bg-amber-200' : 'bg-slate-100'
                      }`} />
                  )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-[2rem] p-12 text-center animate-fade-in max-w-2xl mx-auto">
           <h3 className="text-2xl font-bold text-slate-700 mb-6">Step 1: Choose Your Hero</h3>
           <div className="border-4 border-dashed border-amber-200 rounded-3xl p-16 hover:bg-amber-50/50 hover:border-amber-400 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}>
             <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📸</div>
             <p className="text-slate-500 font-medium text-lg">Upload your child's photo</p>
             <p className="text-slate-400 text-sm mt-2">The AI uses this photo for the cover and internal pages.</p>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
           </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card rounded-[2rem] p-8 md:p-12 animate-fade-in max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
             <h3 className="text-2xl font-bold text-slate-800 font-fantasy">Step 2: Book Details</h3>
             {imagePreview && (
                 <div className="relative">
                     <img src={imagePreview} alt="Hero" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" />
                 </div>
             )}
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Child's Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-lg transition-all"
                        placeholder="e.g. Charlie"
                      />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Design</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setCoverStyle('COLORFUL')}
                                className={`flex items-center justify-center p-4 rounded-xl border text-sm font-bold transition-all ${coverStyle === 'COLORFUL' ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                            >
                                <span className="mr-2">🎨</span> Vibrant
                            </button>
                            <button 
                                onClick={() => setCoverStyle('COLORING')}
                                className={`flex items-center justify-center p-4 rounded-xl border text-sm font-bold transition-all ${coverStyle === 'COLORING' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                            >
                                <span className="mr-2">✏️</span> Coloring
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Physical Traits
                        </label>
                        <input
                            type="text"
                            value={childDescription}
                            onChange={(e) => setChildDescription(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-base transition-all"
                            placeholder="e.g. Long braids, blue eyes..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Skin Tone Setting
                        </label>
                        <select 
                            value={skinTone}
                            onChange={(e) => setSkinTone(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-base transition-all appearance-none"
                        >
                            <option value="">Auto (Match Photo)</option>
                            <option value="Fair Warm Ivory / Golden-Fair">Fair Warm Ivory / Golden-Fair</option>
                            <option value="Light Honey-Mixed">Light Honey-Mixed</option>
                            <option value="Warm Sand / Tan">Warm Sand / Tan</option>
                            <option value="Toasted Caramel">Toasted Caramel</option>
                            <option value="Deep Cocoa">Deep Cocoa</option>
                        </select>
                    </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xs text-amber-800 leading-relaxed">
                        ✨ <strong>Cover Likeness:</strong> The AI uses your photo to ensure the cover features an identical likeness of {name || 'your child'}. If they have specific features like glasses, add them in "Physical Traits".
                    </p>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Target Age</label>
                   <div className="grid grid-cols-3 gap-4">
                       {ageOptions.map(option => (
                           <button
                            key={option.type}
                            onClick={() => setAgeGroup(option.type)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                                ageGroup === option.type ? 'border-amber-400 bg-amber-50 shadow-md transform scale-105' : 'border-slate-100 bg-white hover:border-amber-200 hover:bg-slate-50'
                            }`}
                           >
                               <span className="text-3xl mb-2">{option.icon}</span>
                               <span className={`text-xs font-bold ${ageGroup === option.type ? 'text-amber-700' : 'text-slate-500'}`}>{option.label}</span>
                           </button>
                       ))}
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What happens in the story?</label>
                  <textarea
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none h-32 text-lg transition-all"
                    placeholder="e.g. An adventure in a giant treehouse..."
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                    <button onClick={() => setStep(1)} className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Back</button>
                    <button
                        onClick={handleCreate}
                        disabled={isGenerating || !name || !theme}
                        className={`flex-1 py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${
                            isGenerating || !name || !theme ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                        {isGenerating ? 'Drafting Story... ✍️' : 'Create My Story! 📖'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {step === 3 && (
         <div className="animate-fade-in">
             {!story ? (
                 <div className="glass-card rounded-[2rem] p-20 flex flex-col items-center justify-center text-center">
                     <div className="text-6xl animate-bounce mb-6">✍️</div>
                     <h3 className="text-3xl font-bold text-slate-800 font-fantasy mb-2">Writing your story...</h3>
                     <p className="text-slate-500">We're weaving a consistent adventure for {name}!</p>
                 </div>
             ) : (
                <div className="glass-card rounded-[2rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col border border-amber-100/50">
                    {currentPage === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-amber-50 to-orange-50 flex-grow text-center relative overflow-hidden">
                             <h1 className="text-5xl md:text-7xl font-bold font-fantasy text-amber-900 mb-8 drop-shadow-sm tracking-wide leading-tight">{story[0].text}</h1>
                             <div className="relative mb-12 group">
                                {story[0].image && !loadingIllustrations[0] ? (
                                    <>
                                        <img src={story[0].image} alt="Book Cover" className={`relative w-80 h-80 md:w-96 md:h-96 object-cover rounded-xl shadow-2xl border-8 border-white rotate-1 ${coverStyle === 'COLORING' ? 'bg-white' : ''}`} />
                                        <button onClick={handleRegenerate} className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-lg text-slate-600 hover:text-amber-600 hover:scale-110 transition opacity-0 group-hover:opacity-100 z-10">🔄</button>
                                    </>
                                ) : (
                                    <div className="relative w-80 h-80 md:w-96 md:h-96 bg-white rounded-xl shadow-inner flex flex-col items-center justify-center">
                                         <div className="text-5xl mb-2 animate-bounce">{coverStyle === 'COLORING' ? '✏️' : '🎨'}</div>
                                         <p className="text-amber-400 font-bold mb-2">Painting Cover Likeness...</p>
                                         {renderProgressBar()}
                                    </div>
                                )}
                             </div>
                             <p className="text-amber-800/60 font-serif-story italic text-lg">A magical adventure with {name}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row flex-grow">
                            <div className="lg:w-1/2 bg-slate-100/50 relative flex items-center justify-center p-8 border-r border-slate-200 min-h-[400px]">
                                {story[currentPage].image && !loadingIllustrations[currentPage] ? (
                                    <div className="relative shadow-xl rounded-lg overflow-hidden border-8 border-white bg-white rotate-1 hover:rotate-0 transition-transform duration-500 group">
                                        <img src={story[currentPage].image} alt="Story illustration" className="w-full h-auto max-h-[500px]" />
                                        <button onClick={handleRegenerate} className="absolute top-4 right-4 bg-white/90 p-2 px-4 rounded-full shadow-lg text-slate-700 font-bold text-xs hover:bg-slate-800 hover:text-white transition opacity-0 group-hover:opacity-100">✨ Redraw Page</button>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 flex flex-col items-center w-full max-w-sm">
                                        <div className="text-5xl mb-4 text-slate-300">🖼️</div>
                                        {loadingIllustrations[currentPage] ? (
                                            <>
                                                <p className="text-slate-500 font-medium">Painting with Hero consistency...</p>
                                                {renderProgressBar()}
                                            </>
                                        ) : <p className="text-slate-500 font-medium">Waiting for magic...</p>}
                                    </div>
                                )}
                            </div>
                            <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-between bg-[#fffcf5]">
                                <div>
                                    <span className="text-xs font-bold tracking-widest text-amber-800/60 uppercase mb-6 block border-b border-amber-100 pb-2">Page {currentPage}</span>
                                    <p className="text-xl md:text-2xl font-serif-story text-slate-800 leading-relaxed drop-shadow-sm">{story[currentPage].text}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-[#fffcf5] p-6 border-t border-amber-100 flex justify-between items-center z-10">
                         <button onClick={() => handlePageChange('prev')} disabled={currentPage === 0 || loadingIllustrations[currentPage]} className="px-6 py-2 rounded-full text-amber-800 hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-transparent transition font-bold">← Previous</button>
                         <div className="text-slate-400 text-sm font-serif-story italic">{currentPage === 0 ? "Cover" : `${currentPage} / ${story.length - 1}`}</div>
                         {currentPage === story.length - 1 ? (
                              <button onClick={reset} className="px-6 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition shadow-md font-bold text-sm">Create New Story</button>
                         ) : (
                             <button onClick={() => handlePageChange('next')} disabled={loadingIllustrations[currentPage]} className="px-6 py-2 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition font-bold disabled:opacity-50">Next Page →</button>
                         )}
                    </div>
                </div>
             )}
         </div>
      )}
    </div>
  );
};

export default StoryCreator;