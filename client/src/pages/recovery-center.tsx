import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Injury } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function RecoveryCenterPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: injury, isLoading } = useQuery<Injury>({
    queryKey: ["/api/injuries", id],
    queryFn: async () => {
      const res = await fetch(`/api/injuries/${id}`);
      if (!res.ok) throw new Error("Failed to fetch injury");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          Loading recovery center...
        </div>
      </div>
    );
  }

  if (!injury) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <p>Injury not found</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button onClick={() => navigate("/")}>
          Add New Pain Entry
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{injury.name} Recovery Center</h1>
          <p className="text-muted-foreground mt-2">
            Track and monitor your recovery progress
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Injury Details</h2>
            <div className="bg-card p-4 rounded-lg border">
              <dl className="space-y-2">
                <dt className="text-sm text-muted-foreground">Date of Injury</dt>
                <dd>{new Date(injury.dateOfInjury).toLocaleDateString()}</dd>
                <dt className="text-sm text-muted-foreground mt-2">Description</dt>
                <dd>{injury.description}</dd>
                <dt className="text-sm text-muted-foreground mt-2">Status</dt>
                <dd className="capitalize">{injury.status}</dd>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pain Tracking</h2>
            <p className="text-muted-foreground">
              Track your pain levels and recovery progress over time
            </p>
            <Button onClick={() => navigate("/")}>
              Add New Pain Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}