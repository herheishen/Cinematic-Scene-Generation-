import React, { useState, useRef } from 'react';
import { animateImageWithVeo } from '../services/genai';
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import { GenerationState } from '../types';
import { Spinner } from './Spinner';

export const VideoAnimator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    statusMessage: '',
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const base64 = await fileToBase64(file);
      setPreviewUrl(`data:${file.type};base64,${base64}`);
      setResultVideo(null); // Reset result
    }
  };

  const handleAnimate = async () => {
    if (!selectedFile) return;

    setState({ isLoading: true, statusMessage: 'Preparing assets...', error: null });
    setResultVideo(null);

    try {
      const base64 = await fileToBase64(selectedFile);
      const mimeType = getMimeType(selectedFile);

      setState({ isLoading: true, statusMessage: 'Veo is dreaming up motion... (this may take a minute)', error: null });
      
      const videoUrl = await animateImageWithVeo(base64, mimeType, prompt, aspectRatio);
      setResultVideo(videoUrl);
      setState({ isLoading: false, statusMessage: 'Done', error: null });

    } catch (err: any) {
        if (err.message?.includes('Requested entity was not found')) {
            const aistudio = (window as any).aistudio;
            if (aistudio && aistudio.openSelectKey) {
                 aistudio.openSelectKey();
                 setState({ isLoading: false, statusMessage: '', error: "Please re-select your API key." });
            }
        } else {
            setState({ isLoading: false, statusMessage: '', error: err.message || "Animation failed." });
        }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Controls */}
      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-amber-500 flex items-center gap-2">
            <span className="material-symbols-outlined">movie_filter</span>
            Veo Animation Studio
          </h2>

          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              selectedFile ? 'border-amber-500 bg-amber-900/10' : 'border-slate-600 hover:border-slate-400 bg-slate-900'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            {previewUrl ? (
              <div className="relative inline-block">
                <img src={previewUrl} alt="Preview" className="h-32 rounded shadow-md object-cover" />
                <div className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full p-1 shadow-sm">
                   <span className="material-symbols-outlined text-sm">edit</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-400">add_photo_alternate</span>
                <p className="text-sm text-slate-400">Click to upload source image</p>
              </div>
            )}
          </div>

          <div className="mt-6">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Motion Prompt (Optional)</label>
             <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-amber-600 focus:outline-none"
              placeholder="e.g., Camera pans slowly right, water ripples"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Aspect Ratio</label>
            <div className="flex gap-3">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 ${
                  aspectRatio === '16:9' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined">landscape</span> 16:9
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 ${
                  aspectRatio === '9:16' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined">smartphone</span> 9:16
              </button>
            </div>
          </div>

          <button
            onClick={handleAnimate}
            disabled={state.isLoading || !selectedFile}
            className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
          >
             {state.isLoading ? <Spinner /> : <span className="material-symbols-outlined">videocam_magic</span>}
             {state.isLoading ? state.statusMessage : 'Animate with Veo'}
          </button>

           {state.error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {state.error}
            </div>
          )}
        </div>
      </div>

      {/* Result Area */}
      <div className="flex items-center justify-center bg-black rounded-xl border-2 border-dashed border-slate-800 relative overflow-hidden min-h-[400px]">
        {resultVideo ? (
           <div className="w-full h-full flex flex-col items-center justify-center">
             <video 
               src={resultVideo} 
               controls 
               autoPlay 
               loop 
               className="max-w-full max-h-[80vh] shadow-2xl"
             />
             <a 
               href={resultVideo} 
               download
               className="mt-4 flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium"
             >
               <span className="material-symbols-outlined">download</span> Download MP4
             </a>
           </div>
        ) : (
          <div className="text-center text-slate-600">
             <span className="material-symbols-outlined text-6xl mb-2 opacity-50">movie</span>
             <p className="font-light">Generated video will play here</p>
          </div>
        )}
      </div>
    </div>
  );
};