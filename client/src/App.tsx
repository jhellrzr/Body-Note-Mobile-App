import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Nav from "@/components/layout/nav";
import Dashboard from "@/pages/dashboard";
import PublicPainTracker from "@/pages/public-pain-tracker";
import RecoveryCenterPage from "@/pages/recovery-center";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { SubscriptionButton } from "@/components/subscription-button";
import "./i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicPainTracker} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/recovery/:id" component={RecoveryCenterPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Nav />
          <main className="container mx-auto px-4 py-8">
            <Router />
          </main>
          <SubscriptionButton />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;