import { LayoutDashboard } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
        <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="font-semibold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Body Note
      </span>
    </div>
  );
}
