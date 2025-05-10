import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Nav from "@/components/layout/nav";
import MobileNav from "@/components/layout/mobile-nav";
import Dashboard from "@/pages/dashboard";
import PublicPainTracker from "@/pages/public-pain-tracker";
import RecoveryCenterPage from "@/pages/recovery-center";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { SubscriptionButton } from "@/components/subscription-button";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { useIsMobile } from "@/hooks/use-mobile";
import "./i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <PublicPainTracker />}
      </Route>
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/recovery/:id" component={RecoveryCenterPage} />
      <Route path="/auth">
        {() => <AuthPage />}
      </Route>
      <Route path="*">
        {() => <NotFound />}
      </Route>
    </Switch>
  );
}

function App() {
  const isMobile = useIsMobile();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          {!isMobile && <Nav />}
          <main className={`container mx-auto px-4 ${isMobile ? 'py-4 pb-20' : 'py-8'}`}>
            <Router />
          </main>
          {!isMobile && <SubscriptionButton />}
          <InstallPwaButton />
          <MobileNav />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;