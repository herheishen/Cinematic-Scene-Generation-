import React, { useState } from 'react';
import { AppMode } from './types';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoAnimator } from './components/VideoAnimator';
import ApiKeyWrapper from './components/ApiKeyWrapper';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.IMAGE_GEN);

  return (
    <ApiKeyWrapper>
      <div className="min-h-screen flex flex-col">
        {/* Navigation / Header */}
        <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-50 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <span className="material-symbols-outlined text-3xl">theaters</span>
              <h1 className="text-2xl font-bold tracking-tight text-white brand-font">CineStudio <span className="text-amber-500 text-sm align-top font-sans font-normal border border-amber-500/30 rounded px-1 ml-1">AI</span></h1>
            </div>
            
            <nav className="flex gap-1 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setMode(AppMode.IMAGE_GEN)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  mode === AppMode.IMAGE_GEN 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">image</span>
                Generate Scenes
              </button>
              <button
                onClick={() => setMode(AppMode.VIDEO_ANIM)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  mode === AppMode.VIDEO_ANIM 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                 <span className="material-symbols-outlined text-lg">movie_filter</span>
                Animate (Veo)
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
           <div className="mb-6">
             <h2 className="text-3xl font-light text-white brand-font mb-2">
               {mode === AppMode.IMAGE_GEN ? 'Cinematic Scene Generation' : 'Veo Motion Studio'}
             </h2>
             <p className="text-slate-400 max-w-2xl">
               {mode === AppMode.IMAGE_GEN 
                 ? 'Create ultra-high fidelity production stills using Nano Banana Pro (Gemini 3). Select resolution up to 4K.' 
                 : 'Bring your static images to life with Veo 3.1. Upload a still, choose your framing, and watch it move.'}
             </p>
           </div>

           {mode === AppMode.IMAGE_GEN ? <ImageGenerator /> : <VideoAnimator />}
        </main>
      </div>
    </ApiKeyWrapper>
  );
}

export default App;