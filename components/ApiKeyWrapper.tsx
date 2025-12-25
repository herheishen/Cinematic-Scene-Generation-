import React, { useEffect, useState } from 'react';

// Removed conflicting global declaration. 
// We will treat window.aistudio as implicitly available or cast window to any to avoid TS conflicts
// with existing definitions in the environment.

interface ApiKeyWrapperProps {
  children: React.ReactNode;
}

const ApiKeyWrapper: React.FC<ApiKeyWrapperProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  const checkKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.hasSelectedApiKey) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for dev environments where window.aistudio might not exist yet
        // In a real deployed environment with the proper script, this wouldn't be needed usually.
        // Assuming false if undefined.
        setHasKey(false);
      }
    } catch (e) {
      console.error("Error checking API key selection", e);
      setHasKey(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      // Assume success after interaction and re-check immediately
      setHasKey(true); 
    } else {
      alert("AI Studio environment not detected.");
    }
  };

  if (checking) {
    return <div className="flex h-screen items-center justify-center text-slate-400">Initializing Studio...</div>;
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-6 text-center space-y-6 bg-slate-900">
        <div className="max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="mb-4 text-amber-500">
            <span className="material-symbols-outlined text-6xl">vpn_key</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 brand-font">Access Required</h2>
          <p className="text-slate-300 mb-6">
            To use <strong>Veo 3.1</strong> and <strong>Nano Banana Pro</strong> (Gemini 3 Pro Image), you must select a paid project API key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          <div className="mt-4 text-xs text-slate-500">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">
              View Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiKeyWrapper;