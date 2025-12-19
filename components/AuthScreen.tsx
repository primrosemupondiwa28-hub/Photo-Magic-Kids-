import React, { useState } from 'react';
import { login, signup } from '../services/auth';
import { User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        if (!name) throw new Error("Please enter your name");
        user = await signup(name, email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-white to-blue-50 p-4">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-pink-200/40 blur-[80px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[80px]"></div>
      </div>

      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white">
        
        {/* Left Side (Art) */}
        <div className={`md:w-1/2 p-12 flex flex-col justify-center items-center text-center transition-colors duration-500 ${isLogin ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-400 to-teal-400'}`}>
          <div className="text-6xl md:text-8xl mb-6 animate-bounce-slow">
            {isLogin ? '🏰' : '🚀'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-fantasy mb-4">
            {isLogin ? 'Welcome Back!' : 'Join the Adventure'}
          </h2>
          <p className="text-white/90 text-lg leading-relaxed">
            {isLogin 
              ? "Your magical creations are waiting for you. Let's continue the story!" 
              : "Create an account to start turning photos into storybooks, coloring pages, and magic!"}
          </p>
        </div>

        {/* Right Side (Form) */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 font-fantasy tracking-wide mb-2">Photo Magic Kids</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{isLogin ? 'Sign In' : 'Create Account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 ml-1">Parent's Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError(); }}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="hello@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-500 text-sm font-medium text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                isLoading 
                  ? 'bg-slate-300 cursor-wait' 
                  : isLogin 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-200' 
                    : 'bg-gradient-to-r from-blue-400 to-teal-400 hover:shadow-blue-200'
              }`}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className={`ml-2 font-bold hover:underline ${isLogin ? 'text-pink-500' : 'text-blue-500'}`}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;