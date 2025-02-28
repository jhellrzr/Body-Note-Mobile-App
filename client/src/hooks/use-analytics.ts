import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAnalyticsEvent } from "@shared/schema";

export function useAnalytics() {
  const trackEvent = useMutation({
    mutationFn: async (event: Omit<InsertAnalyticsEvent, "userAgent" | "sessionId">) => {
      const res = await apiRequest("POST", "/api/analytics", event);
      return res.json();
    }
  });

  return {
    trackEvent: (eventName: string, metadata: Record<string, any> = {}) => {
      trackEvent.mutate({
        eventName,
        metadata
      });
    }
  };
}
