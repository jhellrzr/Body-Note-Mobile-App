import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <h1 className="text-xl font-bold mr-8">Body Note</h1>
          <div className="flex space-x-4">
            <Link href="/">
              <a className={cn(
                "px-3 py-2 rounded-md text-sm",
                location === "/" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}>
                Track Pain
              </a>
            </Link>
            <Link href="/gallery">
              <a className={cn(
                "px-3 py-2 rounded-md text-sm",
                location === "/gallery" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}>
                History
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
