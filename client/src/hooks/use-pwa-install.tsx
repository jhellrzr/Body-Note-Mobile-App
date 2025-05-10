import { useState, useEffect, useCallback } from 'react';

// Hook to handle PWA installation
export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e);
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true);
    };

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  // Function to prompt user to install the PWA
  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }

    // Show the install prompt
    try {
      const result = await (installPrompt as any).prompt();
      console.log(`Install prompt was: ${result.outcome}`);
      
      // Reset the install prompt variable, since it can only be used once
      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error while prompting to install PWA:', error);
    }
  }, [installPrompt]);

  return { isInstallable, isInstalled, promptInstall };
}