import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, LineChart, Heart } from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Body Note
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your recovery journey and manage your wellness
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-primary" />
                Symptom Tracker
              </CardTitle>
              <CardDescription>
                Document and visualize pain points with our interactive body mapping tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-sm text-muted-foreground">
                Use our intuitive tools to mark and track pain points, symptoms, and recovery progress over time.
              </p>
              <Button 
                className="w-full"
                onClick={() => setLocation("/tracker")}
              >
                Track Symptoms
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Recovery Center
              </CardTitle>
              <CardDescription>
                Monitor activities, exercises, and daily progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-sm text-muted-foreground">
                Log your daily activities, track exercise routines, and monitor your recovery milestones.
              </p>
              <Button 
                className="w-full"
                onClick={() => setLocation("/dashboard")}
              >
                View Recovery Center
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="h-4 w-4 text-red-500" /> in San Francisco
          </p>
        </div>
      </div>
    </div>
  );
}