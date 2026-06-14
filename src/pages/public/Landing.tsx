import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Download, RefreshCw, ChevronRight, Smartphone } from "lucide-react";
import { useListFeaturedApps } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const { data: featuredApps, isLoading } = useListFeaturedApps();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-[#0b1426] py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
                Amazing Android Apps,{" "}
                <span className="text-primary">Made for You</span>
              </h1>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Download our latest Android apps directly from our official portal. Safe, fast and reliable.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/apps">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base">
                    Browse Apps
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/install-guide">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                    Install Guide
                  </Button>
                </Link>
              </div>

              {/* Feature badges */}
              <div className="mt-10 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">100% Safe</p>
                    <p className="text-slate-400 text-xs">All APKs are safe to install.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                  <Download className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Easy to Install</p>
                    <p className="text-slate-400 text-xs">Direct install on any Android.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                  <RefreshCw className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Regular Updates</p>
                    <p className="text-slate-400 text-xs">We update apps regularly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75"></div>
                <img
                  src="/phone-mockup.png"
                  alt="AMK Apps on Android"
                  className="relative w-64 xl:w-80 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Apps</h2>
              <p className="text-slate-500 mt-1 text-sm">Our most popular Android applications</p>
            </div>
            <Link href="/apps">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:text-primary/80">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 border animate-pulse">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-9 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredApps?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredApps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col hover:shadow-md transition-shadow">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt={app.name} className="w-14 h-14 rounded-xl object-cover mb-4" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                      <Smartphone className="w-7 h-7 text-slate-400" />
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{app.name}</h3>
                  <div className="flex items-center gap-2 mt-1 mb-3">
                    <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0.5">
                      v{app.latestVersion || "1.0.0"}
                    </Badge>
                    <span className="text-xs text-slate-400">{app.totalDownloads?.toLocaleString()} dl</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-4">{app.shortDescription}</p>
                  <Link href={`/apps/${app.slug}`} className="w-full">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                      Download
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-xl bg-white">
              <Smartphone className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-700">No featured apps yet</h3>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/apps">
              <Button variant="outline" className="w-full">View All Apps</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
