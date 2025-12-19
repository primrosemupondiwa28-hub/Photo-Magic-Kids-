import React, { useState, useRef } from 'react';
// Fix: Use hasApiKey instead of getStoredApiKey
import { generateColoringPage, generateIllustration, hasApiKey } from '../services/gemini';
import { AgeGroup } from '../types';

interface ColoringBookProps {
    onOpenSettings: () => void;
}

const ColoringBook: React.FC<ColoringBookProps> = ({ onOpenSettings }) => {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.PRESCHOOL);
  const [themePrompt, setThemePrompt] = useState('');
  const [childDescription, setChildDescription] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPages, setGeneratedPages] = useState<string[]>([]);
  const [progressMessage, setProgressMessage] = useState('');

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

  const handleGenerateBook = async () => {
    if (!themePrompt || !imagePreview) return;
    
    // Fix: Check API Key using hasApiKey and await the response
    const keySet = await hasApiKey();
    if (!keySet) {
        onOpenSettings();
        return;
    }

    setIsGenerating(true);
    setGeneratedPages([]);
    
    try {
        const complexity = ageGroup === AgeGroup.TODDLER 
            ? "very simple outlines, large shapes, low detail" 
            : ageGroup === AgeGroup.PRESCHOOL 
                ? "medium detail, clear lines" 
                : "higher detail, intricate patterns";

        const basePrompt = `Target audience: ${ageGroup}. Complexity level: ${complexity}. Include the character named ${childName || 'the kid'}.`;

        const pagePrompts = [
            `Cover page for a coloring book titled "${childName ? childName + "'s" : 'My'} Adventure". Theme: ${themePrompt}. Central large character based on photo. Big bold text outlines.`,
            `Action scene showing the character based on photo interacting with ${themePrompt}. Fun and dynamic pose.`,
            `Detailed background scene with the character based on photo exploring the world of ${themePrompt}.`
        ];

        const results: string[] = [];
        const base64Data = imagePreview.split(',')[1];
        const mimeType = imagePreview.split(';')[0].split(':')[1];

        // Generate pages sequentially to avoid hitting rate limits too hard and to show progress
        for (let i = 0; i < pagePrompts.length; i++) {
            setProgressMessage(i === 0 ? "Designing the cover... 🎨" : `Drawing page ${i} of ${pagePrompts.length - 1}... ✏️`);
            
            if (i === 0) {
                 // COVER PAGE: Use colorful illustration
                 const coverPrompt = `A bright, vibrant, and colorful children's book cover illustration. Title concept: ${childName}'s Adventure. Theme: ${themePrompt}. Make it look like a professional coloring book cover.`;
                 const image = await generateIllustration(coverPrompt, base64Data, mimeType, childDescription);
                 results.push(image);
            } else {
                 // INNER PAGES: Use Black & White Coloring Page
                 const prompt = `${pagePrompts[i]} ${basePrompt}`;
                 const image = await generateColoringPage(prompt, base64Data, mimeType, childDescription);
                 results.push(image);
            }
            setGeneratedPages([...results]); // Update state as we go
        }
        
        setStep(3);
    } catch (e) {
        console.error(e);
        alert("Could not generate coloring book. Please try again!");
    } finally {
        setIsGenerating(false);
        setProgressMessage('');
    }
  };

  const ageOptions = [
      { type: AgeGroup.TODDLER, icon: '👶', label: 'Toddler (2-3)' },
      { type: AgeGroup.PRESCHOOL, icon: '🧒', label: 'Preschool (4-5)' },
      { type: AgeGroup.EARLY_READER, icon: '📖', label: 'Early Reader (6-8)' },
  ];

  const reset = () => {
    setStep(1);
    setGeneratedPages([]);
    setImageFile(null);
    setImagePreview(null);
    setChildName('');
    setThemePrompt('');
    setChildDescription('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 font-fantasy">Coloring Book Creator 🎨</h2>
        <p className="text-slate-600">Turn your photo into a whole coloring book!</p>
      </div>

       {/* Step Progress */}
       <div className="flex justify-center mb-12 space-x-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-2 w-12 rounded-full transition-colors ${step >= s ? 'bg-pink-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="glass-card rounded-[2.5rem] p-12 text-center animate-fade-in max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Step 1: Upload Your Photo</h3>
          <div className="border-4 border-dashed border-pink-200 rounded-3xl p-16 hover:bg-pink-50/50 hover:border-pink-300 transition-all cursor-pointer group"
               onClick={() => fileInputRef.current?.click()}>
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📸</div>
            <p className="text-slate-500 font-medium text-lg">Click to upload a clear photo</p>
            <p className="text-slate-400 text-sm mt-2">We'll turn you into a coloring character!</p>
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
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 animate-fade-in max-w-3xl mx-auto">
           <div className="flex items-center justify-between mb-8 border-b border-pink-100 pb-6">
             <h3 className="text-2xl font-bold text-slate-800 font-fantasy">Step 2: Customize Your Book</h3>
             {imagePreview && (
                 <img src={imagePreview} alt="Upload" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" />
             )}
           </div>

           <div className="space-y-8">
                {/* Name */}
                <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Child's Name</label>
                    <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="e.g. Maya"
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-lg transition-all"
                    />
                </div>

                {/* Appearance Description for better representation */}
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Appearance Details (Recommended)
                  </label>
                  <input
                    type="text"
                    value={childDescription}
                    onChange={(e) => setChildDescription(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-lg transition-all"
                    placeholder="e.g. Curly hair, braids, glasses, etc..."
                  />
                  <p className="text-xs text-slate-400 mt-2">
                      💡 Specifying hair texture (like "curly" or "braids") ensures the line art looks exactly like your child, avoiding generic outlines.
                  </p>
                </div>

                {/* Age Group */}
                <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Age Group</label>
                    <div className="grid grid-cols-3 gap-4">
                        {ageOptions.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => setAgeGroup(option.type)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                                    ageGroup === option.type
                                    ? 'border-pink-500 bg-pink-50 shadow-md transform scale-105'
                                    : 'border-slate-100 bg-white hover:border-pink-200 hover:bg-slate-50'
                                }`}
                            >
                                <span className="text-3xl mb-2">{option.icon}</span>
                                <span className={`text-xs font-bold ${
                                    ageGroup === option.type ? 'text-pink-700' : 'text-slate-500'
                                }`}>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme */}
                <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Coloring Book Theme / Idea</label>
                    <textarea
                        value={themePrompt}
                        onChange={(e) => setThemePrompt(e.target.value)}
                        placeholder="E.g., Underwater adventure, Superhero city, Magical forest..."
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none h-32 text-lg transition-all"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={() => setStep(1)}
                        className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleGenerateBook}
                        disabled={isGenerating || !themePrompt}
                        className={`flex-1 py-4 rounded-xl font-bold text-xl text-white shadow-lg transition-all ${
                            isGenerating || !themePrompt
                            ? 'bg-slate-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                        {isGenerating ? progressMessage : 'Create Coloring Book! 📚'}
                    </button>
                </div>
           </div>
        </div>
      )}

      {/* Step 3: Results (or partial results while generating) */}
      {(step === 3 || isGenerating) && generatedPages.length > 0 && (
          <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-slate-800 font-fantasy">Your Coloring Book</h3>
                 {!isGenerating && (
                     <button onClick={reset} className="text-pink-600 font-bold hover:underline">Create Another</button>
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedPages.map((pageUrl, index) => (
                      <div key={index} className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100 animate-slide-up">
                          <p className={`text-center font-bold mb-2 text-sm ${index === 0 ? 'text-pink-600 uppercase tracking-widest' : 'text-slate-400'}`}>
                              {index === 0 ? '✨ Cover Page ✨' : `Page ${index}`}
                          </p>
                          <div className={`aspect-[3/4] border-2 rounded-xl overflow-hidden mb-4 ${index === 0 ? 'border-pink-200' : 'border-slate-900'}`}>
                              <img src={pageUrl} alt={`Page ${index + 1}`} className="w-full h-full object-contain bg-white" />
                          </div>
                          <a 
                            href={pageUrl}
                            download={index === 0 ? 'cover-page.png' : `coloring-page-${index}.png`}
                            className={`block w-full py-2 font-bold rounded-xl text-center transition ${index === 0 ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-md' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}
                          >
                              Download ⬇️
                          </a>
                      </div>
                  ))}
                  
                  {isGenerating && generatedPages.length < 3 && (
                      <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-300 flex items-center justify-center aspect-[3/4]">
                          <div className="text-center">
                              <div className="text-4xl mb-2 animate-bounce">✏️</div>
                              <p className="text-slate-400 font-bold">Drawing next page...</p>
                          </div>
                      </div>
                  )}
              </div>

              {!isGenerating && (
                  <div className="mt-8 text-center bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
                      <p className="text-slate-800 font-bold text-lg mb-4">Ready to print?</p>
                      <button 
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 shadow-lg transition hover:-translate-y-1"
                      >
                          Print All Pages 🖨️
                      </button>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default ColoringBook;