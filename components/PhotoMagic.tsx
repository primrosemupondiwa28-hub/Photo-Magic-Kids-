import React, { useState, useRef, useEffect } from 'react';
import { Character, ArtStyle, Theme } from '../types';
import { CHARACTERS_LIST, ART_STYLES_LIST, THEMES_DATA } from '../constants';
import { generateMagicPhoto } from '../services/gemini';

const PhotoMagic: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(Theme.CHRISTMAS);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(Character.SANTA);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.REALISTIC);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing Magic...');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Analyzing visual identity...",
    "Locking skin tone fidelity...",
    "Matching facial anchors...",
    "Crafting the setting...",
    "Polishing the masterpiece...",
    "Almost ready..."
  ];

  useEffect(() => {
    let interval: any;
    let messageInterval: any;

    if (isGenerating) {
      setGenerationProgress(0);
      setLoadingMessage(loadingMessages[0]);

      interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 98) return 98;
          const jump = prev < 50 ? 5 : prev < 85 ? 2 : 0.5;
          return prev + jump;
        });
      }, 300);

      let msgIdx = 0;
      messageInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[msgIdx]);
      }, 2000);
    } else {
      setGenerationProgress(0);
    }

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [isGenerating]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setStep(2);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    setIsGenerating(true);
    setError(null);
    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      
      const fullPrompt = `Create a high-quality ${selectedStyle} image where the child from the photo is TOGETHER WITH ${selectedCharacter} in a ${selectedTheme} setting. 
      The child in the resulting image must match the EXACT likeness, facial structure, and skin tone of the person in the uploaded photo. 
      Additional details: ${customPrompt}. 
      NOTE: Zero racial bias or assumptions. Match the subject's identity as seen in the photo perfectly. Preserve skin tone and facial features exactly.`;
      
      const generatedImage = await generateMagicPhoto(base64Data, fullPrompt, mimeType);
      setResultImage(generatedImage);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "The magic ink ran out!");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setImagePreview(null);
    setResultImage(null);
    setCustomPrompt('');
    setGenerationProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-slate-800 mb-4 font-fantasy tracking-tight">The Photo Studio ✨</h2>
        <p className="text-slate-500 text-xl font-medium">Create legendary encounters with pixel-perfect identity matching.</p>
      </div>

      {/* Modern Progress Line */}
      <div className="flex justify-center mb-16 px-4">
        <div className="flex items-center w-full max-w-xl">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                  <div className={`relative flex flex-col items-center group`}>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-lg transition-all duration-500 ${
                        step >= s 
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-200 scale-110' 
                        : 'bg-white text-slate-300 border border-slate-100'
                    }`}>
                        {step > s ? '✓' : s}
                    </div>
                  </div>
                  {s < 4 && (
                      <div className="flex-grow mx-2 h-1 rounded-full overflow-hidden bg-slate-100">
                         <div className={`h-full bg-rose-600 transition-all duration-700 ${step > s ? 'w-full' : 'w-0'}`} />
                      </div>
                  )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-[3rem] p-16 text-center animate-fade-in max-w-2xl mx-auto">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-rose-50 rounded-[2.5rem] p-20 hover:bg-rose-50/30 hover:border-rose-200 transition-all cursor-pointer group"
          >
            <div className="w-28 h-28 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-5xl shadow-inner text-rose-600">
                📸
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-3">Upload Portrait</h3>
            <p className="text-slate-400 font-medium">Use a clear, bright photo for absolute identity accuracy.</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800">Select Magic World</h3>
            <p className="text-slate-500 font-medium">Where should the adventure take place?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {THEMES_DATA.map((theme) => (
              <button
                key={theme.id}
                onClick={() => { setSelectedTheme(theme.id); setStep(3); }}
                className="glass-card p-10 rounded-[2.5rem] hover:shadow-2xl hover:border-rose-200 transition-all hover:-translate-y-2 group text-center"
              >
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-all duration-500">{theme.icon}</div>
                <h4 className="text-2xl font-bold text-slate-800 mb-2">{theme.label}</h4>
                <p className="text-sm text-slate-400 font-medium">{theme.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-12 gap-10 animate-fade-in items-start px-4">
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-card rounded-[2.5rem] p-10">
              <h3 className="font-bold text-2xl text-slate-800 mb-8 font-fantasy">1. Choose Hero Partner</h3>
              <div className="grid grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {CHARACTERS_LIST.map(char => (
                  <button
                    key={char}
                    onClick={() => setSelectedCharacter(char)}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                      selectedCharacter === char 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-100 scale-105' 
                        : 'bg-white text-slate-500 border-slate-50 hover:border-rose-100 hover:bg-rose-50/30'
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-10">
              <h3 className="font-bold text-2xl text-slate-800 mb-8 font-fantasy">2. Refine Appearance</h3>
              <div className="grid grid-cols-1 gap-8 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Vibe Style</label>
                  <select 
                    value={selectedStyle} 
                    onChange={(e) => setSelectedStyle(e.target.value as ArtStyle)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none font-bold text-slate-700 transition-all appearance-none"
                  >
                    {ART_STYLES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add special details (e.g. wearing a cape, holding a sword...)"
                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-32">
             <div className="glass-card rounded-[2.5rem] p-10 text-center">
                <div className="relative w-full aspect-square mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white mb-8 group">
                  {imagePreview && <img src={imagePreview} alt="Original" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
                       <div className="w-20 h-20 mb-4 text-5xl animate-bounce">🪄</div>
                       <p className="text-rose-600 font-bold mb-4 animate-pulse">{loadingMessage}</p>
                       <div className="w-full max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-600 transition-all duration-300 ease-out" style={{ width: `${generationProgress}%` }}></div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{Math.round(generationProgress)}% COMPLETE</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`relative w-full py-6 rounded-2xl font-bold text-xl shadow-2xl transition-all active:scale-95 overflow-hidden ${
                    isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-rose-700'
                  }`}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying Magic...
                    </span>
                  ) : 'Generate Artpiece ✨'}
                </button>
                {error && <p className="text-red-500 text-sm mt-6 font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
             </div>
          </div>
        </div>
      )}

      {step === 4 && resultImage && (
        <div className="animate-fade-in max-w-3xl mx-auto px-4">
          <div className="glass-card rounded-[3rem] p-12 text-center">
            <h3 className="text-4xl font-bold text-slate-800 mb-10 font-fantasy">The Masterpiece! ✨</h3>
            <div className="relative group">
                <img src={resultImage} alt="Result" className="w-full h-auto rounded-[2.5rem] shadow-2xl mb-12 border-4 border-white" />
                <div className="absolute inset-0 rounded-[2.5rem] bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button onClick={reset} className="px-10 py-4 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50 transition-all">Start New Project</button>
              <a href={resultImage} download className="px-10 py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-xl shadow-rose-200 hover:shadow-rose-300 transition-all hover:-translate-y-1">Save to Library ⬇️</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoMagic;