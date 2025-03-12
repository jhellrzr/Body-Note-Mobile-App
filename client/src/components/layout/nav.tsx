import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import Logo from "./logo";
import LanguageToggle from "./language-toggle";
import { Button } from "@/components/ui/button";
import { LineChart, Home } from "lucide-react";

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant={location === "/dashboard" ? "default" : "ghost"}
                  className="flex items-center gap-2"
                >
                  <LineChart className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}