import { Link, useLocation } from "wouter";
import { useGetMe, useAdminLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Package,
  Upload,
  BarChart,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false },
  });
  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation("/admin/login");
    }
  }, [user, isLoading, isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1426]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout.mutateAsync(undefined);
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/apps", icon: Package, label: "Apps" },
    { href: "/admin/upload", icon: Upload, label: "Versions" },
    { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
  ];

  return (
    <div className="min-h-[100dvh] flex w-full bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0b1426] flex flex-col border-r border-white/10 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/amk-icon.png" alt="AMK Apps" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-bold text-white text-lg tracking-tight">AMK Apps</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-10">
          <div className="flex-1 text-sm text-slate-500">
            Welcome, <span className="font-medium text-slate-800">Admin</span>
          </div>
          <Link href="/">
            <span className="text-sm text-primary hover:underline cursor-pointer">View Site →</span>
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
