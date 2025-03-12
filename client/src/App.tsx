import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/layout/nav";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Exercises from "@/pages/exercises";
import NotFound from "@/pages/not-found";
import { SubscriptionButton } from "@/components/subscription-button";
import "./i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/exercises" component={Exercises} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto px-4 py-8">
          <Router />
        </main>
        <SubscriptionButton />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;