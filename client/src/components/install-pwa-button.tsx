import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export function InstallPwaButton() {
  const { isInstallable, promptInstall } = usePwaInstall();
  const isMobile = useIsMobile();
  const [showButton, setShowButton] = useState(false);

  // Show button after a delay to avoid showing it unnecessarily
  useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 3000); // 3 seconds delay
      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
    }
  }, [isInstallable]);

  if (!showButton) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 shadow-lg rounded-full">
      <Button
        onClick={promptInstall}
        size="lg"
        className="rounded-full px-4 py-4 flex items-center gap-2"
      >
        <Download className="h-5 w-5" />
        <span>{isMobile ? "Install App" : "Install Desktop App"}</span>
      </Button>
    </div>
  );
}