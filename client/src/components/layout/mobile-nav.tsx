import { Link, useLocation } from "wouter";
import { 
  Home, 
  BarChart2, 
  Heart, 
  User,
  ActivitySquare
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  if (!isMobile) return <></>;
  
  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full h-16 bg-background border-t border-border flex justify-around items-center px-2">
      <NavItem 
        href="/" 
        icon={<Home className="w-6 h-6" />} 
        label="Home"
        isActive={location === "/"} 
      />
      
      {user ? (
        <>
          <NavItem 
            href="/dashboard" 
            icon={<BarChart2 className="w-6 h-6" />} 
            label="Dashboard"
            isActive={location === "/dashboard"}
          />
          
          <NavItem 
            href="/tracking" 
            icon={<ActivitySquare className="w-6 h-6" />} 
            label="Track"
            isActive={location.startsWith("/tracking")}
          />
          
          <NavItem 
            href="/recovery" 
            icon={<Heart className="w-6 h-6" />} 
            label="Recovery"
            isActive={location.startsWith("/recovery")}
          />
        </>
      ) : (
        <NavItem 
          href="/auth" 
          icon={<User className="w-6 h-6" />} 
          label="Account"
          isActive={location === "/auth"}
        />
      )}
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
  return (
    <Link href={href}>
      <a className="flex flex-col items-center justify-center w-full h-full">
        <div className={cn(
          "flex flex-col items-center justify-center",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </div>
      </a>
    </Link>
  );
}