import { cn } from "@/lib/utils";
import Logo from "./logo";

export default function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Logo />
        </div>
      </div>
    </nav>
  );
}