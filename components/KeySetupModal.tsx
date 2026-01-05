import React, { useState, useEffect } from 'react';

interface KeySetupModalProps {
  onSuccess: () => void;
}

const KeySetupModal: React.FC<KeySetupModalProps> = ({ onSuccess }) => {
  const [hasChecked, setHasChecked] = useState(false);
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (hasKey) {
          onSuccess();
        } else {
          setShowGate(true);
        }
      } else {
        // Not in AI Studio environment or API missing, assume key is provided via env
        onSuccess();
      }
      setHasChecked(true);
    };

    checkKey();
  }, [onSuccess]);

  const handleOpenKeySelector = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Per instructions: assume success and proceed to mitigate race conditions
      onSuccess();
    }
  };

  if (!hasChecked || !showGate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-fade-in">
      <div className="max-w-md w-full glass-card rounded-[3rem] p-12 text-center shadow-2xl border-2 border-rose-100/20">
        <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner text-rose-600 animate-float">
          ✨
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4 font-fantasy tracking-tight">Activate the Magic</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          To generate world-class AI art and stories, you need to connect your Google Cloud Gemini key.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleOpenKeySelector}
            className="w-full py-5 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl hover:bg-rose-700 transition-all hover:-translate-y-1 active:scale-95"
          >
            Connect Gemini Key 🪄
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm font-bold text-rose-600 hover:text-rose-700 underline underline-offset-4"
          >
            How do I get a key?
          </a>
        </div>
        
        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Secure Connection • Official Gemini Studio
        </p>
      </div>
    </div>
  );
};

export default KeySetupModal;