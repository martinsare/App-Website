import { Link, useLocation } from "wouter";
import { Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/apps", label: "Apps" },
    { href: "/install-guide", label: "Install Guide" },
    { href: "/updates", label: "Updates" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-[#0b1426] border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/amk-icon.png" alt="AMK Apps" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-bold text-xl tracking-tight text-white">AMK Apps</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.startsWith(link.href)
                    ? "text-primary"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-300 hover:text-white hover:bg-white/10">
                Admin
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Get Apps</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#0b1426] border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} AMK Apps. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 mt-3">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verified APKs
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4 text-primary" /> Fast Downloads
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
