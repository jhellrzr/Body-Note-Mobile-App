import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionModal } from "./subscription-modal";

export function SubscriptionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 shadow-md rounded-full w-auto h-auto p-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-4 w-4" />
      </Button>
      <SubscriptionModal open={open} onOpenChange={setOpen} />
    </>
  );
}
