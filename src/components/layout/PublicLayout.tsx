import { Link, useLocation } from "wouter";
import { Download, ShieldCheck, Smartphone, Settings } from "lucide-react";
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
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground">
              <Smartphone className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">AMK Apps</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith(link.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="sm">Get Apps</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AMK Apps. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4 text-primary" /> Fast Downloads
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
