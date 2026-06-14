import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListApps } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Smartphone, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Updates() {
  const { data: apps, isLoading } = useListApps();

  // In a real app we'd query versions directly, but here we derive recent updates from apps
  const recentUpdates = apps
    ? [...apps]
        .filter(app => app.releaseDate)
        .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
    : [];

  return (
    <PublicLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Latest Updates</h1>
          <p className="text-lg text-muted-foreground">Stay up to date with the newest app versions</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : recentUpdates.length > 0 ? (
          <div className="space-y-6">
            {recentUpdates.map((app) => (
              <div key={app.id} className="flex gap-4 p-6 border rounded-xl bg-card hover:border-primary/50 transition-colors">
                {app.iconUrl ? (
                  <img src={app.iconUrl} alt={app.name} className="w-16 h-16 rounded-xl object-cover border bg-card" />
                ) : (
                  <div className="w-16 h-16 rounded-xl border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <Smartphone className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{app.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-mono bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                          v{app.latestVersion}
                        </span>
                        <span>•</span>
                        <span>{format(new Date(app.releaseDate!), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <Link href={`/apps/${app.slug}`}>
                      <Button size="sm" variant="outline" className="shrink-0">
                        View App
                      </Button>
                    </Link>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {app.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border rounded-xl bg-card text-muted-foreground">
            No updates found.
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
