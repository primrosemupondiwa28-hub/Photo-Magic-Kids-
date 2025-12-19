import React, { useState, useRef } from 'react';
import { Character, Ethnicity, ArtStyle, Theme } from '../types';
import { CHARACTERS_LIST, ETHNICITIES_LIST, ART_STYLES_LIST, CHARACTER_LOCATIONS, CHARACTER_POSES, THEMES_DATA } from '../constants';
import { generateMagicPhoto, getStoredApiKey } from '../services/gemini';

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

interface PhotoMagicProps {
  onOpenSettings: () => void;
}

const PhotoMagic: React.FC<PhotoMagicProps> = ({ onOpenSettings }) => {
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
      setStep(2); // Go to Theme Selection
    }
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setStep(3); // Go to Character Selection
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    // Check API Key
    if (!getStoredApiKey()) {
        onOpenSettings();
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Construct prompt logic
      const locations = CHARACTER_LOCATIONS[selectedCharacter];
      const poses = CHARACTER_POSES[selectedCharacter];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const randomPose = poses[Math.floor(Math.random() * poses.length)];
      
      const fullPrompt = `Generate a photorealistic image of the child from the provided photo appearing TOGETHER WITH a ${selectedCharacter}.
      
      SCENE COMPOSITION:
      - The child should be standing next to, hugging, high-fiving, or interacting with the ${selectedCharacter}.
      - The child is NOT transformed into the character. They are meeting the character.
      - Setting: ${selectedTheme} theme. ${randomLoc}.
      - Action: ${randomPose}.
      
      STYLE & APPEARANCE:
      - Art Style: ${selectedStyle}.
      - Character Details: The ${selectedCharacter} should have a ${selectedEthnicity} appearance. IMPORTANT: This ethnicity setting applies ONLY to the ${selectedCharacter}. DO NOT apply this ethnicity to the child.
      - Additional Details: ${customPrompt}.

      CRITICAL IDENTITY PRESERVATION INSTRUCTIONS:
      - You must PRESERVE the child's exact skin tone, facial features, hair texture, and eye color from the uploaded source photo.
      - Do not darken, lighten, or change the child's skin tone. It must match the source photo exactly.
      - Do not alter the child's racial characteristics or ethnicity.
      - The child in the generated image must be instantly recognizable as the specific child in the photo.
      - Ensure high quality, consistent lighting between the child and the character.`;

      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];

      const generatedImage = await generateMagicPhoto(base64Data, fullPrompt, mimeType);
      setResultImage(generatedImage);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Something went wrong with the magic!");
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

      {/* Elegant Progress Bar */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                      step >= s 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-white text-slate-300 border border-slate-100'
                  }`}>
                      {step > s ? '✓' : s}
                  </div>
                  {s < 4 && (
                      <div className={`w-12 h-1 rounded-full transition-colors duration-300 ${
                          step > s ? 'bg-indigo-200' : 'bg-slate-100'
                      }`} />
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
            <p className="text-slate-400 max-w-xs mx-auto">Choose a clear, well-lit photo of the child. Front-facing photos work best.</p>
            <button className="mt-8 px-6 py-3 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl shadow-sm group-hover:shadow-md transition-all">
                Select from Gallery
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
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
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-transparent rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{theme.icon}</div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">{theme.label}</h4>
                <p className="text-sm text-slate-500">{theme.description}</p>
              </button>
            ))}
          </div>
          
          <div className="mt-10 text-center">
             <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 font-medium transition-colors">← Choose a different photo</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-12 gap-8 animate-fade-in items-start">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-xl text-slate-800 font-fantasy">1. Choose a Character</h3>
                 <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-wide">{selectedTheme}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {CHARACTERS_LIST.map(char => (
                  <button
                    key={char}
                    onClick={() => setSelectedCharacter(char)}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      selectedCharacter === char 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50'
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
                  <div className="relative">
                      <select 
                        value={selectedEthnicity} 
                        onChange={(e) => setSelectedEthnicity(e.target.value as Ethnicity)}
                        className="w-full p-3 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none"
                      >
                        {ETHNICITIES_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Art Style</label>
                  <div className="relative">
                      <select 
                        value={selectedStyle} 
                        onChange={(e) => setSelectedStyle(e.target.value as ArtStyle)}
                        className="w-full p-3 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none"
                      >
                        {ART_STYLES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Magical Details (Optional)</label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. wearing a red scarf, holding a blue balloon..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  
                  {/* Inspiration Prompts */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2 font-medium">✨ Tap to add inspiration:</p>
                    <div className="flex flex-wrap gap-2">
                        {INSPIRATION_PROMPTS.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => setCustomPrompt(prompt)}
                                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 hover:scale-105 transition-all"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 space-y-6">
             <div className="glass-card rounded-[2rem] p-8 flex flex-col items-center text-center sticky top-24">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 mb-6">
                  {imagePreview && <img src={imagePreview} alt="Original" className="w-full h-full object-cover" />}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 backdrop-blur-sm">Original Photo</div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-700 mb-1">Ready to create magic?</h3>
                <p className="text-sm text-slate-400 mb-6">We'll generate a scene with {selectedCharacter} in {selectedStyle} style.</p>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center ${
                    isGenerating 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl'
                  }`}
                >
                  {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Weaving Magic...
                      </>
                  ) : 'Generate Photo 🪄'}
                </button>
                {error && <p className="text-red-500 text-sm mt-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                
                <button onClick={() => setStep(2)} className="mt-6 text-slate-400 text-sm hover:text-slate-600 font-medium">Change Theme</button>
             </div>
          </div>
        </div>
      )}

      {step === 4 && resultImage && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="glass-card rounded-[2rem] p-10 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"></div>
            
            <h3 className="text-3xl font-bold text-slate-800 mb-2 font-fantasy">Magical Moment Created! ✨</h3>
            <p className="text-slate-500 mb-8">A precious memory for your collection.</p>
            
            <div className="flex justify-center mb-10">
              <div className="relative rounded-lg overflow-hidden shadow-2xl bg-white p-4 rotate-1 hover:rotate-0 transition-transform duration-500">
                <img src={resultImage} alt="Magic Result" className="w-full h-auto max-h-[500px] rounded-sm" />
                <div className="mt-4 font-handwriting text-center text-slate-400 text-sm font-fantasy tracking-wider">
                    {selectedTheme} • {new Date().getFullYear()}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={reset}
                className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Create Another
              </button>
              <a 
                href={resultImage} 
                download={`magic-photo-${Date.now()}.png`}
                className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center"
              >
                Download Keepsake ⬇️
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoMagic;