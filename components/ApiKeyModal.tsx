import React, { useState, useEffect } from 'react';
import { getStoredApiKey, setStoredApiKey, validateApiKey, removeStoredApiKey } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      if (stored) {
        setKey(stored);
        // Don't validate automatically on open to save quota/time, unless user presses test
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!key.trim()) return;
    setStatus('validating');
    const isValid = await validateApiKey(key);
    if (isValid) {
      setStoredApiKey(key);
      setStatus('valid');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1000);
    } else {
      setStatus('invalid');
    }
  };

  const handleClear = () => {
    removeStoredApiKey();
    setKey('');
    setStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
          <h2 className="text-2xl font-bold text-gray-800">Unlock the Magic</h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter your Google Gemini API Key to enable all magical features.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setStatus('idle'); }}
              placeholder="AIzaSy..."
              className="w-full p-3 rounded-xl border-2 border-purple-100 focus:border-purple-500 outline-none font-mono text-sm"
            />
          </div>

          {status === 'invalid' && (
            <p className="text-red-500 text-sm text-center">❌ That key didn't work. Please try again.</p>
          )}
          {status === 'valid' && (
            <p className="text-green-500 text-sm text-center">✅ Key verified and saved!</p>
          )}

          <button
            onClick={handleSave}
            disabled={status === 'validating' || !key}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${
              status === 'validating' 
                ? 'bg-gray-400 cursor-wait' 
                : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
            }`}
          >
            {status === 'validating' ? 'Checking...' : 'Save Key'}
          </button>
          
          {getStoredApiKey() && (
             <button
                onClick={handleClear}
                className="w-full py-2 text-sm text-red-400 hover:text-red-600 font-medium"
             >
                Remove saved key
             </button>
          )}

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Don't have a key?{" "}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-purple-600 font-bold hover:underline"
              >
                Get one here
              </a>
            </p>
            <p className="text-[10px] text-gray-400 mt-2">
              Your key is stored securely in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
