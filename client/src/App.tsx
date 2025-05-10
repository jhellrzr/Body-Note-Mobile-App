import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/layout/nav";
import MobileNav from "@/components/layout/mobile-nav";
import PublicPainTracker from "@/pages/public-pain-tracker";
import NotFound from "@/pages/not-found";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { useIsMobile } from "@/hooks/use-mobile";
import "./i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <PublicPainTracker />}
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
      <div className="min-h-screen bg-background">
        {!isMobile && <Nav />}
        <main className={`container mx-auto px-4 ${isMobile ? 'py-4 pb-20' : 'py-8'}`}>
          <Router />
        </main>
        <InstallPwaButton />
        <MobileNav />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;