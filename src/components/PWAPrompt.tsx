import { useState, useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

export default function PWAPrompt() {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if device is mobile
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android/i.test(userAgent);
    const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent);
    
    setIsMobile(isMobileDevice);
    setIsIOS(isIOSDevice);

    // If app is already installed or standalone mode, don't show
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      return;
    }

    // Check if dismissed before
    const hasDismissed = localStorage.getItem('pwaPromptDismissed');
    if (!hasDismissed && isMobileDevice) {
      // Small delay so it's not jarring
      setTimeout(() => setShowPrompt(true), 3000);
    }

    // For Android/Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      if (!hasDismissed && isMobileDevice) {
        setShowPrompt(true);
      }
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Just show the iOS specific UI instructions which are already in the render
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || !isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up sm:hidden">
      <div className="bg-[#1A1A1A] border border-[rgba(201,168,76,0.3)] rounded-2xl p-4 shadow-2xl relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-12 h-12 bg-black rounded-xl border border-[rgba(201,168,76,0.5)] flex items-center justify-center flex-shrink-0 text-[#D4AF37] font-serif text-2xl font-bold">
            I
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Add INDÉRA to Home Screen</h3>
            <p className="text-gray-400 text-xs mt-0.5">For a faster, app-like experience.</p>
          </div>
        </div>

        {isIOS && !deferredPrompt ? (
          <div className="bg-black/50 rounded-xl p-3 text-xs text-gray-300 flex flex-col gap-2 border border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37]">1.</span> Tap the <Share className="w-4 h-4 inline mx-1" /> Share button below
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37]">2.</span> Select "Add to Home Screen" <PlusSquare className="w-4 h-4 inline mx-1" />
            </div>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-[#D4AF37] hover:bg-[#C9A84C] text-black font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
