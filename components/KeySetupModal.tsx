import React from 'react';
import { openKeySelector } from '../services/gemini';

interface KeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const KeySetupModal: React.FC<KeySetupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleSetup = async () => {
    await openKeySelector();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg relative border border-indigo-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition"
        >
          ✕
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
            🔑
          </div>
          <h2 className="text-3xl font-bold text-slate-800 font-fantasy">Unlock Your Magic</h2>
          <p className="text-slate-500 text-lg mt-4 leading-relaxed">
            To power your private magic studio, you need to connect your own Google Gemini key. 
            This keeps your creations private and your magic unlimited!
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2">Important Instructions</h4>
            <ul className="text-sm text-amber-700 space-y-2 list-disc pl-4">
              <li>You must select a key from a <strong>paid GCP project</strong>.</li>
              <li>New keys can be generated in your Gemini Dashboard.</li>
              <li>Read more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline font-bold decoration-amber-300">GCP Billing & Documentation</a>.</li>
            </ul>
          </div>

          <button
            onClick={handleSetup}
            className="w-full py-5 rounded-2xl font-bold text-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Connect My Key ✨
          </button>
          
          <p className="text-center text-xs text-slate-400">
            Your key is handled securely by the platform and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeySetupModal;