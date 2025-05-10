import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info, Settings } from "lucide-react";
import { useLocation } from "wouter";
import Logo from "./logo";
import LanguageToggle from "./language-toggle";

export default function Nav() {
  const [, navigate] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/about")}
            >
              <Info className="mr-2 h-4 w-4" />
              About
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}