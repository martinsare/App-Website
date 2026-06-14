import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListApps } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Search } from "lucide-react";
import { useState } from "react";

export default function AppsList() {
  const [search, setSearch] = useState("");
  const { data: apps, isLoading } = useListApps({ search: search || undefined });

  return (
    <PublicLayout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Android Apps</h1>
              <p className="text-muted-foreground mt-1">Browse and download safe, verified APKs</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search apps..." 
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : apps?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
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
                        {app.totalDownloads?.toLocaleString()} dl
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
          <div className="text-center py-20 border rounded-xl bg-card">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No apps found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
