import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/layout/nav";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Exercises from "@/pages/exercises";
import NotFound from "@/pages/not-found";
import SymptomTracker from "@/pages/symptom-tracker";
import { SubscriptionButton } from "@/components/subscription-button";
import "./i18n"; // Import i18n configuration
import { Heart } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tracker" component={SymptomTracker} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/exercises" component={Exercises} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <main className="container mx-auto px-4 py-8 flex-1">
          <Router />
        </main>
        <footer className="border-t py-4">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            Made with <Heart className="w-3 h-3 inline text-red-500" /> in San Francisco
          </div>
        </footer>
        <SubscriptionButton />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;