import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/public/Landing";
import InstallGuide from "@/pages/public/InstallGuide";
import AppsList from "@/pages/public/AppsList";
import AppDetail from "@/pages/public/AppDetail";
import Updates from "@/pages/public/Updates";

import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import AdminAppsList from "@/pages/admin/AppsList";
import AppForm from "@/pages/admin/AppForm";
import AppVersions from "@/pages/admin/AppVersions";
import UploadVersion from "@/pages/admin/UploadVersion";
import Analytics from "@/pages/admin/Analytics";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/apps" component={AppsList} />
      <Route path="/apps/:slug" component={AppDetail} />
      <Route path="/install-guide" component={InstallGuide} />
      <Route path="/updates" component={Updates} />
      
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/apps" component={AdminAppsList} />
      <Route path="/admin/apps/new" component={AppForm} />
      <Route path="/admin/apps/:id/edit" component={AppForm} />
      <Route path="/admin/apps/:id/versions" component={AppVersions} />
      <Route path="/admin/upload" component={UploadVersion} />
      <Route path="/admin/analytics" component={Analytics} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
