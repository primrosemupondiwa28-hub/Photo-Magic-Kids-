import React, { useState, useRef } from 'react';
import { Character, Ethnicity, ArtStyle, Theme } from '../types';
import { CHARACTERS_LIST, ETHNICITIES_LIST, ART_STYLES_LIST, CHARACTER_LOCATIONS, CHARACTER_POSES, THEMES_DATA } from '../constants';
import { generateMagicPhoto } from '../services/gemini';

const INSPIRATION_PROMPTS = [
  "Wearing a golden crown 👑",
  "Holding a magic glowing wand ✨",
  "Wearing a red superhero cape 🦸",
  "Surrounded by colorful butterflies 🦋",
  "Holding a vintage lantern 🏮",
  "Sitting on a crystal throne 🪑",
  "Holding a bouquet of wildflowers 💐",
  "Wearing a space helmet 👩‍🚀",
  "Holding a teddy bear 🧸",
  "Wearing cool sunglasses 😎"
];

const PhotoMagic: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [selectedTheme, setSelectedTheme] = useState<Theme>(Theme.CHRISTMAS);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(Character.SANTA);
  const [selectedEthnicity, setSelectedEthnicity] = useState<Ethnicity>(Ethnicity.CLASSIC);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.REALISTIC);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setStep(2);
    }
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setStep(3);
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const locations = CHARACTER_LOCATIONS[selectedCharacter];
      const poses = CHARACTER_POSES[selectedCharacter];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const randomPose = poses[Math.floor(Math.random() * poses.length)];
      
      const fullPrompt = `Generate a photorealistic image of the child from the provided photo appearing TOGETHER WITH a ${selectedCharacter}.
      SCENE: ${selectedTheme} theme. ${randomLoc}. Action: ${randomPose}.
      STYLE: ${selectedStyle}. Character details: ${selectedCharacter} as ${selectedEthnicity}.
      IDENTITY: The child must look exactly like the photo. Match skin tone and hair.
      DETAILS: ${customPrompt}.`;

      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];

      const generatedImage = await generateMagicPhoto(base64Data, fullPrompt, mimeType);
      setResultImage(generatedImage);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "The magic ink ran out! Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setImageFile(null);
    setImagePreview(null);
    setResultImage(null);
    setCustomPrompt('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-slate-800 mb-2 font-fantasy">Photo Magic ✨</h2>
        <p className="text-slate-500 text-lg">Create a keepsake where your child meets their hero.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                      step >= s 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-white text-slate-300 border border-slate-100'
                  }`}>
                      {step > s ? '✓' : s}
                  </div>
                  {s < 4 && (
                      <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-indigo-200' : 'bg-slate-100'}`} />
                  )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {step === 1 && (
        <div className="glass-card rounded-[2rem] p-12 text-center animate-fade-in max-w-2xl mx-auto">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-indigo-100 rounded-3xl p-16 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group"
          >
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform text-4xl shadow-inner text-indigo-500">
                📸
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Upload a Photo</h3>
            <p className="text-slate-400 max-w-xs mx-auto">Front-facing photos work best for character recognition.</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Choose the Occasion</h3>
            <p className="text-slate-500">Select a theme for your magical photo shoot</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {THEMES_DATA.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className="glass-card p-8 rounded-[2rem] hover:shadow-xl hover:border-indigo-200 transition-all hover:-translate-y-1 group text-center relative overflow-hidden"
              >
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{theme.icon}</div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">{theme.label}</h4>
                <p className="text-sm text-slate-500">{theme.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-12 gap-8 animate-fade-in items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card rounded-[2rem] p-8">
              <h3 className="font-bold text-xl text-slate-800 mb-6 font-fantasy">1. Choose a Character</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {CHARACTERS_LIST.map(char => (
                  <button
                    key={char}
                    onClick={() => setSelectedCharacter(char)}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      selectedCharacter === char 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-8">
              <h3 className="font-bold text-xl text-slate-800 mb-6 font-fantasy">2. Fine Tune</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Character Look</label>
                  <select 
                    value={selectedEthnicity} 
                    onChange={(e) => setSelectedEthnicity(e.target.value as Ethnicity)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {ETHNICITIES_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Art Style</label>
                  <select 
                    value={selectedStyle} 
                    onChange={(e) => setSelectedStyle(e.target.value as ArtStyle)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {ART_STYLES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. wearing a red scarf, holding a blue balloon..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
             <div className="glass-card rounded-[2rem] p-8 text-center sticky top-24">
                <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-6">
                  {imagePreview && <img src={imagePreview} alt="Original" className="w-full h-full object-cover" />}
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${
                    isGenerating ? 'bg-slate-300 text-slate-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  }`}
                >
                  {isGenerating ? 'Weaving Magic...' : 'Generate Photo 🪄'}
                </button>
                {error && <p className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded">{error}</p>}
             </div>
          </div>
        </div>
      )}

      {step === 4 && resultImage && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="glass-card rounded-[2rem] p-10 text-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-8 font-fantasy">Magical Moment! ✨</h3>
            <img src={resultImage} alt="Magic Result" className="w-full h-auto rounded-xl shadow-2xl mb-8" />
            <div className="flex justify-center gap-4">
              <button onClick={reset} className="px-8 py-3 rounded-xl border font-bold">Create Another</button>
              <a href={resultImage} download className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold">Download ⬇️</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoMagic;