import React, { useState } from 'react';
import { generateCinematicImage } from '../services/genai';
import { AspectRatio, ImageSize, GenerationState } from '../types';
import { Spinner } from './Spinner';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    statusMessage: '',
    error: null,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState({ isLoading: true, statusMessage: 'Setting the scene...', error: null });
    setResultImage(null);

    try {
      setState(prev => ({ ...prev, statusMessage: 'Rendering with Nano Banana Pro...' }));
      const base64Image = await generateCinematicImage(prompt, imageSize, aspectRatio);
      setResultImage(base64Image);
      setState({ isLoading: false, statusMessage: 'Done', error: null });
    } catch (err: any) {
      if (err.message?.includes('Requested entity was not found')) {
        // Handle race condition/billing issue prompt
        const aistudio = (window as any).aistudio;
        if (aistudio && aistudio.openSelectKey) {
             aistudio.openSelectKey();
             setState({ isLoading: false, statusMessage: '', error: "Please re-select your API key." });
        }
      } else {
        setState({ isLoading: false, statusMessage: '', error: err.message || "Generation failed." });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Controls */}
      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-amber-500 flex items-center gap-2">
            <span className="material-symbols-outlined">brush</span>
            Scene Description
          </h2>
          
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-600 focus:outline-none h-32 resize-none transition-all"
            placeholder="Describe a cinematic scene (e.g., A noir detective standing under a neon rain-soaked streetlamp, cyberpunk style, high contrast)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(['16:9', '1:1', '9:16'] as AspectRatio[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-2 px-3 text-sm rounded-md border transition-colors ${
                      aspectRatio === r 
                        ? 'bg-amber-600 border-amber-500 text-white' 
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setImageSize(s)}
                    className={`py-2 px-3 text-sm rounded-md border transition-colors ${
                      imageSize === s 
                        ? 'bg-amber-600 border-amber-500 text-white' 
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={state.isLoading || !prompt.trim()}
            className="w-full mt-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {state.isLoading ? <Spinner /> : <span className="material-symbols-outlined">auto_awesome</span>}
            {state.isLoading ? state.statusMessage : 'Generate Scene'}
          </button>

          {state.error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {state.error}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 relative overflow-hidden min-h-[400px]">
        {resultImage ? (
          <div className="relative group w-full h-full flex items-center justify-center">
             <img 
               src={resultImage} 
               alt="Generated Scene" 
               className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <a 
                  href={resultImage} 
                  download={`cine-studio-${Date.now()}.png`}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 text-white border border-white/30 transition-all"
                >
                  <span className="material-symbols-outlined">download</span>
                </a>
             </div>
          </div>
        ) : (
          <div className="text-center text-slate-600">
             <span className="material-symbols-outlined text-6xl mb-2 opacity-50">image</span>
             <p className="font-light">Your masterpiece will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};