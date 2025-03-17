import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Logo from "./logo";
import LanguageToggle from "./language-toggle";

export default function Nav() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            )}
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}