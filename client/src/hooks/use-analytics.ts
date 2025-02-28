import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAnalyticsEvent } from "@shared/schema";

export function useAnalytics() {
  const trackEventMutation = useMutation({
    mutationFn: async (event: Omit<InsertAnalyticsEvent, "userAgent" | "sessionId">) => {
      try {
        const res = await apiRequest("POST", "/api/analytics", event);
        return res.json();
      } catch (error) {
        console.error('Analytics tracking error:', error);
        // Fail silently to not disrupt the user experience
      }
    }
  });

  return {
    trackEvent: (eventName: string, metadata: Record<string, any> = {}) => {
      trackEventMutation.mutate({
        eventName,
        metadata
      });
    }
  };
}