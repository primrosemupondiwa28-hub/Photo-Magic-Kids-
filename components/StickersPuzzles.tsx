
import React, { useState, useRef } from 'react';
// Remove hasApiKey as the API key is handled externally via process.env.API_KEY
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
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-500 hover:bg-pink-50'
            }`}
          >
            Sticker Maker
          </button>
          <button
            onClick={() => setActiveTab('PUZZLES')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'PUZZLES'
                ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-500 hover:bg-teal-50'
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState('3D Avatar');
  const [appearanceDescription, setAppearanceDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setResultImage(null);
    }
  };

  const stylePrompts: Record<string, string> = {
    '3D Avatar': '3D Pixar-style rendered character, cute, expressive, soft lighting, 3d render',
    'Chibi': 'Chibi anime style, large head, small body, cute, vibrant, flat color',
    'Cartoon': 'Classic Saturday morning cartoon style, bold outlines, flat colors',
    'Superhero': 'Wearing a generic superhero costume with cape, heroic pose, comic book style',
    'Emoji': 'Expressive emoji style face sticker, round, emotive, vector',
    'Pixel Art': 'Retro 8-bit pixel art style, arcade game look'
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    // Remove API key check as per guidelines: availability is handled externally
    setIsGenerating(true);
    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      
      const promptToUse = stylePrompts[style] || style;

      const sticker = await generateSticker(base64Data, promptToUse, mimeType, appearanceDescription);
      setResultImage(sticker);
    } catch (e) {
      console.error(e);
      alert("Oops! Could not make sticker.");
    } finally {
      setIsGenerating(false);
    }
  };

  const stickerStyles = Object.keys(stylePrompts);

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
       <div className="glass-card rounded-[2.5rem] p-8">
          <h3 className="font-bold text-xl text-slate-800 mb-4 font-fantasy">1. Upload Photo</h3>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-pink-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-pink-50/50 transition min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden"
          >
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-sm object-contain" />
            ) : (
                <>
                    <span className="text-4xl mb-2 text-pink-300">📸</span>
                    <p className="text-slate-500 font-medium">Click to upload</p>
                </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="mt-6">
             <h3 className="font-bold text-lg text-slate-700 mb-2">2. Appearance (Optional)</h3>
             <input
                type="text"
                value={appearanceDescription}
                onChange={(e) => setAppearanceDescription(e.target.value)}
                placeholder="e.g. Curly brown hair, glasses..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-pink-500 outline-none text-sm"
             />
             <p className="text-xs text-slate-400 mt-1">Helps match hair and features perfectly!</p>
          </div>

          <div className="mt-6">
             <h3 className="font-bold text-lg text-slate-700 mb-2">3. Choose Style</h3>
             <div className="flex flex-wrap gap-2">
                {stickerStyles.map(s => (
                    <button 
                        key={s} 
                        onClick={() => setStyle(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${style === s ? 'border-pink-500 bg-pink-500 text-white shadow-md' : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        {s}
                    </button>
                ))}
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!imagePreview || isGenerating}
            className={`w-full mt-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                isGenerating || !imagePreview
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            {isGenerating ? 'Creating Avatar Sticker... ✨' : 'Generate Sticker!'}
          </button>
       </div>

       <div className="glass-card rounded-[2.5rem] p-8 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white border border-white">
          {resultImage ? (
              <div className="text-center w-full">
                  <h3 className="font-bold text-xl text-slate-800 mb-4 font-fantasy">Your Sticker!</h3>
                  <div className="bg-white p-8 rounded-2xl shadow-inner mb-6 flex items-center justify-center relative">
                     {/* Checkered background for transparency illusion */}
                     <div className="absolute inset-0 z-0 opacity-10" style={{
                         backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                         backgroundSize: '20px 20px',
                         backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                     }}></div>
                    <img src={resultImage} alt="Sticker" className="max-h-64 mx-auto drop-shadow-2xl animate-bounce-in object-contain relative z-10" />
                  </div>
                  <a 
                    href={resultImage}
                    download="my-avatar-sticker.png"
                    className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition shadow-lg hover:-translate-y-1"
                  >
                      Download Sticker ⬇️
                  </a>
              </div>
          ) : (
              <div className="text-slate-300 text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-6xl block mb-4 grayscale opacity-50">⭐</span>
                  <p className="text-lg font-medium text-slate-400">Your custom sticker<br/>will appear here</p>
                  <p className="text-sm mt-2 opacity-70">Try "3D Avatar" or "Superhero" style!</p>
              </div>
          )}
       </div>
    </div>
  );
};

// Simple Sliding Puzzle Game
const PuzzleGame: React.FC = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [tiles, setTiles] = useState<number[]>([]);
    const [isSolved, setIsSolved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const GRID_SIZE = 3;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                startNewGame();
            };
            reader.readAsDataURL(file);
        }
    };

    const startNewGame = () => {
        const newTiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        let current = [...newTiles];
        let emptyIdx = current.length - 1;
        
        for (let i = 0; i < 100; i++) {
            const possibleMoves = [];
            const row = Math.floor(emptyIdx / GRID_SIZE);
            const col = emptyIdx % GRID_SIZE;
            if (row > 0) possibleMoves.push(emptyIdx - GRID_SIZE); // Up
            if (row < GRID_SIZE - 1) possibleMoves.push(emptyIdx + GRID_SIZE); // Down
            if (col > 0) possibleMoves.push(emptyIdx - 1); // Left
            if (col < GRID_SIZE - 1) possibleMoves.push(emptyIdx + 1); // Right
            
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            [current[emptyIdx], current[move]] = [current[move], current[emptyIdx]];
            emptyIdx = move;
        }
        setTiles(current);
        setIsSolved(false);
    };

    const handleTileClick = (index: number) => {
        if (isSolved) return;
        const emptyIdx = tiles.indexOf(GRID_SIZE * GRID_SIZE - 1); // Assuming last index is empty
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
        const emptyCol = emptyIdx % GRID_SIZE;

        const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
            setTiles(newTiles);
            checkWin(newTiles);
        }
    };

    const checkWin = (currentTiles: number[]) => {
        const win = currentTiles.every((val, index) => val === index);
        if (win) setIsSolved(true);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            {!imagePreview ? (
                 <div className="glass-card rounded-[2.5rem] p-12 text-center max-w-md w-full">
                    <h3 className="text-2xl font-bold text-teal-600 mb-4 font-fantasy">Start Puzzle</h3>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-4 border-dashed border-teal-200 rounded-2xl p-8 cursor-pointer hover:bg-teal-50 transition"
                    >
                        <span className="text-6xl block mb-2">🧩</span>
                        <p className="text-slate-500">Upload a photo to play!</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                    {/* Or use sample */}
                    <button 
                        onClick={() => {
                            setImagePreview("https://picsum.photos/600/600");
                            startNewGame();
                        }}
                        className="mt-4 text-teal-500 underline text-sm font-bold"
                    >
                        Use random picture
                    </button>
                 </div>
            ) : (
                <div className="glass-card rounded-[2.5rem] p-8 w-full max-w-xl">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setImagePreview(null)} className="text-slate-400 hover:text-slate-600 font-bold">← Back</button>
                        <h3 className="text-xl font-bold text-teal-800">Solve the Puzzle!</h3>
                        <button onClick={startNewGame} className="text-teal-500 font-bold hover:underline">Shuffle 🔄</button>
                    </div>

                    <div 
                        className="grid gap-1 mx-auto bg-slate-200 p-2 rounded-xl relative"
                        style={{ 
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: '100%',
                            maxWidth: '400px',
                            aspectRatio: '1/1'
                        }}
                    >
                        {isSolved && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-xl animate-fade-in">
                                <div className="text-center text-white">
                                    <div className="text-6xl mb-2">🏆</div>
                                    <h2 className="text-3xl font-bold">YOU WON!</h2>
                                    <button onClick={startNewGame} className="mt-4 px-6 py-2 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow-lg hover:scale-105 transition">Play Again</button>
                                </div>
                            </div>
                        )}

                        {tiles.map((tileIndex, positionIndex) => {
                             // Last tile is "empty"
                             const isEmpty = tileIndex === GRID_SIZE * GRID_SIZE - 1;
                             if (isEmpty) return <div key={positionIndex} className="bg-slate-100/50 rounded-md"></div>;

                             const x = (tileIndex % GRID_SIZE) * 100;
                             const y = Math.floor(tileIndex / GRID_SIZE) * 100;

                             return (
                                 <div
                                    key={positionIndex}
                                    onClick={() => handleTileClick(positionIndex)}
                                    className="cursor-pointer transition-all duration-200 hover:opacity-90 rounded-md overflow-hidden relative shadow-sm"
                                    style={{
                                        backgroundImage: `url(${imagePreview})`,
                                        backgroundSize: `${GRID_SIZE * 100}%`,
                                        backgroundPosition: `${x}% ${y}%`,
                                    }}
                                 >
                                    <div 
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${imagePreview})`,
                                            backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                                            backgroundPosition: `${(tileIndex % GRID_SIZE) * (100 / (GRID_SIZE - 1))}% ${Math.floor(tileIndex / GRID_SIZE) * (100 / (GRID_SIZE - 1))}%`
                                        }}
                                    />
                                 </div>
                             );
                        })}
                    </div>
                    <p className="text-center text-slate-400 text-sm mt-4 font-medium">Tap a tile next to the empty space to move it.</p>
                </div>
            )}
        </div>
    );
};

export default StickersPuzzles;
