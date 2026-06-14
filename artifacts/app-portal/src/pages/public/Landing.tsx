import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Download, RefreshCw, ChevronRight, Smartphone } from "lucide-react";
import { useListFeaturedApps } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const { data: featuredApps, isLoading } = useListFeaturedApps();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            <Smartphone className="w-4 h-4" />
            <span>AMK Apps Portal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Amazing Android Apps, <br className="hidden md:block" />
            <span className="text-primary">Made for You.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Discover, download, and install high-quality Android applications directly to your device. Safe, secure, and always up to date.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apps">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                Browse Apps
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/install-guide">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base bg-background">
                Installation Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x">
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground text-sm">All APKs are verified and safe to install on any Android device.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Install</h3>
              <p className="text-muted-foreground text-sm">Direct APK downloads with no complicated app store requirements.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Regular Updates</h3>
              <p className="text-muted-foreground text-sm">Get the latest features and bug fixes as soon as they're released.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Apps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Apps</h2>
              <p className="text-muted-foreground mt-2">Our most popular Android applications</p>
            </div>
            <Link href="/apps">
              <Button variant="ghost" className="hidden sm:flex">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex flex-row gap-4">
                    <div className="w-16 h-16 bg-muted rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredApps?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map((app) => (
                <Card key={app.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row gap-4 items-start pb-4">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.name} className="w-16 h-16 rounded-xl object-cover border bg-card" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
                        <Smartphone className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl truncate">{app.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs font-normal">
                          v{app.latestVersion || "1.0.0"}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {app.totalDownloads?.toLocaleString()} downloads
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">{app.shortDescription}</p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t mt-auto">
                    <Link href={`/apps/${app.slug}`} className="w-full">
                      <Button className="w-full" variant="outline">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-xl bg-card">
              <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">No featured apps yet</h3>
              <p className="text-muted-foreground">Check back soon for amazing Android apps.</p>
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/apps">
              <Button variant="outline" className="w-full">
                View All Apps
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
