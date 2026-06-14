import { Link, useLocation } from "wouter";
import { useGetMe, useAdminLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Package,
  Upload,
  BarChart,
  LogOut,
  Smartphone,
  Menu,
  FileBox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      retry: false,
    },
  });

  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation("/admin/login");
    }
  }, [user, isLoading, isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = async () => {
    await logout.mutateAsync(undefined);
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/apps", icon: Package, label: "Apps" },
    { href: "/admin/upload", icon: Upload, label: "Upload Version" },
    { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-[100dvh] flex w-full bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">AMK Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2 py-4">
              {navItems.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm truncate mr-2 text-muted-foreground">
                {user.email}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center px-4 md:px-6 bg-card sticky top-0 z-10">
            <SidebarTrigger className="-ml-2 mr-4" />
            <div className="flex-1" />
            <Link href="/">
              <Button variant="outline" size="sm">
                View Site
              </Button>
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
