import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListApps } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Search, Download } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function AppsList() {
  const [search, setSearch] = useState("");
  const { data: apps, isLoading } = useListApps({ search: search || undefined });

  return (
    <PublicLayout>
      {/* Page header */}
      <div className="bg-[#0b1426] py-8 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">All Apps</h1>
              <p className="text-slate-400 mt-1 text-sm">Explore and download all our Android apps.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search apps..."
                className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:bg-white/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border animate-pulse">
                <div className="w-14 h-14 bg-slate-200 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="h-9 w-24 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : apps?.length ? (
          <div className="space-y-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm hover:border-slate-300 transition-all"
              >
                {/* Icon */}
                {app.iconUrl ? (
                  <img src={app.iconUrl} alt={app.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Smartphone className="w-7 h-7 text-slate-400" />
                  </div>
                )}

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{app.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{app.shortDescription}</p>
                </div>

                {/* Version + date */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="secondary" className="font-mono text-xs">
                    v{app.latestVersion || "1.0.0"}
                  </Badge>
                  {app.releaseDate && (
                    <span className="text-xs text-slate-400">
                      {format(new Date(app.releaseDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Link href={`/apps/${app.slug}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                  </Link>
                  <Link href={`/apps/${app.slug}`}>
                    <Button size="sm" variant="outline" className="hidden sm:flex">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Pagination hint */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400">2</Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400">3</Button>
              <span className="text-slate-400 text-sm">...</span>
              <Button variant="ghost" size="sm" className="text-slate-400">Next</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border rounded-xl">
            <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-base font-medium text-slate-700">No apps found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
