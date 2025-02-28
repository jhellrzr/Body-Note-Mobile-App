import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscriptionMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('subscription.checkEmail', 'Please check your email to confirm your subscription.'),
      });
      setEmail("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: t('error'),
        description: t('subscription.emailRequired', 'Please enter your email address.'),
        variant: "destructive"
      });
      return;
    }
    subscriptionMutation.mutate(email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('subscription.title', 'Stay Updated')}</DialogTitle>
          <DialogDescription>
            {t('subscription.description', 'Subscribe to receive updates about new features and improvements.')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder={t('subscription.emailPlaceholder', 'Enter your email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={subscriptionMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {t('subscription.submit', 'Subscribe')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
