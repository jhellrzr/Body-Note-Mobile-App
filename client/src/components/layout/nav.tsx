import { cn } from "@/lib/utils";
import Logo from "./logo";
import LanguageToggle from "./language-toggle";

export default function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}