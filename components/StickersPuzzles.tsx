import React, { useState, useRef } from 'react';
import { generateSticker } from '../services/gemini';

type Tab = 'STICKERS' | 'PUZZLES';

const StickersPuzzles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('STICKERS');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 font-fantasy">Fun Zone! 🧩</h2>
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => setActiveTab('STICKERS')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'STICKERS'
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-lg scale-105'
                : 'bg-white text-slate-500 hover:bg-rose-50'
            }`}
          >
            Sticker Maker
          </button>
          <button
            onClick={() => setActiveTab('PUZZLES')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'PUZZLES'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-500 hover:bg-amber-50'
            }`}
          >
            Puzzle Game
          </button>
        </div>
      </div>

      {activeTab === 'STICKERS' ? <StickerMaker /> : <PuzzleGame />}
    </div>
  );
};

const StickerMaker: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState('3D Avatar');
  const [appearanceDescription, setAppearanceDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stylePrompts: Record<string, string> = {
    '3D Avatar': '3D Pixar-style rendered character, high polish, expressive',
    'Chibi': 'Super-cute chibi anime style, big eyes, simple colors',
    'Cartoon': 'Classic animation style, bold outlines, expressive face',
    'Superhero': 'Cool superhero costume with cape and emblem, comic book style',
    'Emoji': 'Fun emoji-style facial expression, vector graphics',
    'Pixel Art': 'Retro 16-bit pixel art style, high detail'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
      setResultImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    setIsGenerating(true);
    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      const promptToUse = stylePrompts[style] || style;
      
      // Explicitly instructing the AI to match the visual reality of the photo
      const enhancedAppearance = `The character MUST have the EXACT SAME light skin tone and facial identity as the uploaded photo. 
      Trait details: ${appearanceDescription}. 
      CRITICAL: Match the photo pixels for the child's actual identity. If the child is a light-skinned biracial child, the sticker MUST be light-skinned biracial. Do not apply racial archetypes or change skin tone based on hair texture.`;
      
      const sticker = await generateSticker(base64Data, promptToUse, mimeType, enhancedAppearance);
      setResultImage(sticker);
    } catch (e) {
      console.error(e);
      alert("Oops! The sticker machine hit a snag.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
       <div className="glass-card rounded-[2.5rem] p-8">
          <h3 className="font-bold text-xl text-slate-800 mb-4 font-fantasy">1. Upload Photo</h3>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-rose-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-rose-50/50 transition min-h-[200px] flex flex-col justify-center items-center overflow-hidden"
          >
            {imagePreview ? <img src={imagePreview} className="max-h-48 rounded-lg border-2 border-white shadow-md" alt="Preview" /> : <><span className="text-4xl mb-2">📸</span><p className="text-slate-500">Click to upload photo</p></>}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="mt-6">
             <h3 className="font-bold text-lg text-slate-700 mb-2">2. Appearance (Optional)</h3>
             <input 
                type="text" 
                value={appearanceDescription} 
                onChange={(e) => setAppearanceDescription(e.target.value)} 
                placeholder="e.g. wearing a pink dress, curly hair..." 
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-rose-500 outline-none text-sm transition-all" 
             />
             <p className="text-[10px] text-slate-400 mt-1 italic">Note: The studio automatically preserves skin tone and facial features from your photo.</p>
          </div>

          <div className="mt-6">
             <h3 className="font-bold text-lg text-slate-700 mb-2">3. Style</h3>
             <div className="flex flex-wrap gap-2">
                {Object.keys(stylePrompts).map(s => (
                    <button key={s} onClick={() => setStyle(s)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${style === s ? 'border-rose-600 bg-rose-600 text-white shadow-md' : 'border-slate-100 bg-white text-slate-600 hover:border-rose-200'}`}>{s}</button>
                ))}
             </div>
          </div>

          <button onClick={handleGenerate} disabled={!imagePreview || isGenerating} className={`w-full mt-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${isGenerating || !imagePreview ? 'bg-slate-300' : 'bg-gradient-to-r from-rose-600 to-red-700 hover:shadow-xl hover:-translate-y-1'}`}>{isGenerating ? 'Analyzing Magic... ✨' : 'Generate Identity Sticker!'}</button>
       </div>

       <div className="glass-card rounded-[2.5rem] p-8 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
          {resultImage ? (
              <div className="text-center w-full">
                  <h3 className="font-bold text-xl text-slate-800 mb-4 font-fantasy">Your Sticker!</h3>
                  <div className="bg-white p-8 rounded-2xl shadow-inner mb-6 relative border border-slate-100">
                    <img src={resultImage} alt="Sticker" className="max-h-64 mx-auto drop-shadow-2xl animate-bounce-in" />
                  </div>
                  <a href={resultImage} download="sticker.png" className="inline-block px-10 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition shadow-lg">Download Sticker ⬇️</a>
              </div>
          ) : <div className="text-slate-300 text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center"><span className="text-6xl block mb-4 grayscale opacity-50">⭐</span><p className="text-lg font-medium text-slate-400">Your identity-matched sticker<br/>will appear here</p></div>}
       </div>
    </div>
  );
};

const PuzzleGame: React.FC = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tiles, setTiles] = useState<number[]>([]);
    const [isSolved, setIsSolved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const GRID_SIZE = 3;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result as string); startNewGame(); };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const startNewGame = () => {
        const newTiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        let current = [...newTiles];
        let emptyIdx = current.length - 1;
        for (let i = 0; i < 50; i++) {
            const moves = [];
            const r = Math.floor(emptyIdx/3), c = emptyIdx%3;
            if(r>0)moves.push(emptyIdx-3); if(r<2)moves.push(emptyIdx+3);
            if(c>0)moves.push(emptyIdx-1); if(c<2)moves.push(emptyIdx+1);
            const m = moves[Math.floor(Math.random()*moves.length)];
            [current[emptyIdx], current[m]] = [current[m], current[emptyIdx]];
            emptyIdx = m;
        }
        setTiles(current); setIsSolved(false);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            {!imagePreview ? (
                 <div className="glass-card rounded-[2.5rem] p-12 text-center max-w-md w-full">
                    <h3 className="text-2xl font-bold text-amber-600 mb-4 font-fantasy">Start Puzzle</h3>
                    <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-amber-200 rounded-2xl p-8 cursor-pointer hover:bg-amber-50 transition">
                        <span className="text-6xl block mb-2">🧩</span>
                        <p className="text-slate-500">Upload a photo to play!</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                 </div>
            ) : (
                <div className="glass-card rounded-[2.5rem] p-8 w-full max-w-xl">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setImagePreview(null)} className="text-slate-400 font-bold">← Back</button>
                        <h3 className="text-xl font-bold text-amber-800 font-fantasy">Solve the Puzzle!</h3>
                        <button onClick={startNewGame} className="text-amber-500 font-bold hover:underline">Shuffle 🔄</button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mx-auto bg-slate-200 p-2 rounded-xl" style={{maxWidth: '400px', aspectRatio: '1/1'}}>
                        {tiles.map((tileIndex, pos) => (
                            tileIndex === 8 ? <div key={pos} className="bg-slate-100/50 rounded-md" /> :
                            <div key={pos} className="rounded-md overflow-hidden bg-white" style={{backgroundImage: `url(${imagePreview})`, backgroundSize: '300%', backgroundPosition: `${(tileIndex%3)*50}% ${Math.floor(tileIndex/3)*50}%`}} />
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-center text-slate-400">Puzzles use your original photo directly for 100% fidelity.</p>
                </div>
            )}
        </div>
    );
};

export default StickersPuzzles;