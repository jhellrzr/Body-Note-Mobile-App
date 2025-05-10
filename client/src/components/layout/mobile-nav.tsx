import { Link, useLocation } from "wouter";
import { 
  Home,
  Settings,
  Info
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { lightHapticFeedback } from "@/lib/haptics";

export default function MobileNav() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return <></>;
  
  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full h-16 bg-background border-t border-border flex justify-around items-center px-2">
      <NavItem 
        href="/" 
        icon={<Home className="w-6 h-6" />} 
        label="Home"
        isActive={location === "/"} 
      />
      
      <NavItem 
        href="/about" 
        icon={<Info className="w-6 h-6" />} 
        label="About"
        isActive={location === "/about"}
      />
      
      <NavItem 
        href="/settings" 
        icon={<Settings className="w-6 h-6" />} 
        label="Settings"
        isActive={location === "/settings"}
      />
    </nav>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  isActive 
}: { 
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  const handleClick = () => {
    // Provide tactile feedback when navigation item is clicked
    lightHapticFeedback();
  };
  
  return (
    <Link href={href}>
      <a 
        className="flex flex-col items-center justify-center w-full h-full"
        onClick={handleClick}
        onTouchStart={() => {}}  // Empty handler to enable active state styling on touch
      >
        <div className={cn(
          "flex flex-col items-center justify-center transition-transform active:scale-95",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </div>
      </a>
    </Link>
  );
}