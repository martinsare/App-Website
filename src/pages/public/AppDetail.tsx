import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetApp, useGetSignedDownloadUrl, useRecordDownload } from "@workspace/api-client-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useParams } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Calendar, HardDrive, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function AppDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: app, isLoading, isError } = useGetApp(slug, {
    query: { enabled: !!slug }
  });
  const recordDownload = useRecordDownload();
  const getSignedDownloadUrl = useGetSignedDownloadUrl();

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !app) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">App Not Found</h1>
          <p className="text-slate-500 mt-2">The requested app could not be found.</p>
        </div>
      </PublicLayout>
    );
  }

  const latestVersion = app.versions?.find(v => v.isLatest) || app.versions?.[0];

  const handleDownload = async (versionId: string, apkPath: string) => {
    try {
      if (import.meta.env.DEV) {
        const url = await getSignedDownloadUrl.mutateAsync({ apkPath });
        await recordDownload.mutateAsync({
          data: { appId: app.id, versionId, userAgent: window.navigator.userAgent }
        });
        window.location.href = url;
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error("Sign in required to download this APK.");
      }

      const response = await fetch(`/api/download?versionId=${encodeURIComponent(versionId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to download APK.");
      }

      await recordDownload.mutateAsync({
        data: { appId: app.id, versionId, userAgent: window.navigator.userAgent }
      });

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = apkPath.split("/").pop() || `${app.slug}.apk`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("Sign in required")) {
        window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      console.error(error);
      window.alert("Unable to download the APK right now. Please try again.");
    }
  };

  return (
    <PublicLayout>
      {/* Header bar */}
      <div className="bg-[#0b1426] border-b border-white/10 py-3">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/apps" className="hover:text-white transition-colors">Apps</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{app.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* App header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="w-20 h-20 rounded-2xl object-cover shadow-md shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              <Smartphone className="w-10 h-10 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">{app.name}</h1>
              {latestVersion?.isLatest && (
                <Badge className="bg-green-100 text-green-700 border-0 font-medium">Latest</Badge>
              )}
            </div>
            <p className="text-slate-500 mb-4">{app.shortDescription}</p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-5 text-sm">
              <div className="text-center">
                <div className="font-bold text-slate-900">{latestVersion?.versionNumber || "—"}</div>
                <div className="text-slate-400 text-xs">Version</div>
              </div>
              {latestVersion?.fileSize && (
                <div className="text-center">
                  <div className="font-bold text-slate-900">{latestVersion.fileSize}</div>
                  <div className="text-slate-400 text-xs">Size</div>
                </div>
              )}
              {app.releaseDate && (
                <div className="text-center">
                  <div className="font-bold text-slate-900">{format(new Date(app.releaseDate), "MMM d, yyyy")}</div>
                  <div className="text-slate-400 text-xs">Release Date</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download button */}
        {latestVersion && (
          <div className="mb-8">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white h-12 px-8"
              onClick={() => handleDownload(latestVersion.id, latestVersion.apkUrl)}
            >
              <Download className="w-5 h-5 mr-2" />
              Download APK ({latestVersion.fileSize || `v${latestVersion.versionNumber}`})
            </Button>
            <p className="text-xs text-slate-400 mt-2">This app is for Android devices only.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* Screenshots */}
            {app.screenshots && app.screenshots.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Screenshots</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {app.screenshots.map((shot) => (
                      <CarouselItem key={shot.id} className="basis-1/2 sm:basis-1/3">
                        <img
                          src={shot.imageUrl}
                          alt="Screenshot"
                          className="rounded-xl border shadow-sm aspect-[9/16] object-cover w-full bg-slate-100"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </section>
            )}

            {/* What's New */}
            {app.changelog && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3">What's New in v{latestVersion?.versionNumber}</h2>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {app.changelog.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{line.replace(/^[-•]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Version History */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Version History</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Version</th>
                      <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Notes</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {app.versions?.map((version) => (
                      <tr key={version.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-slate-800">v{version.versionNumber}</span>
                            {version.isLatest && (
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">Latest</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {format(new Date(version.releaseDate), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell max-w-[200px] truncate">
                          {version.changelog?.split('\n')[0] || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDownload(version.id, version.apkUrl)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!app.versions?.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No versions available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* App info card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">App Info</h3>
              {latestVersion?.fileSize && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> File Size</span>
                  <span className="font-medium text-slate-700">{latestVersion.fileSize}</span>
                </div>
              )}
              {app.releaseDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Updated</span>
                  <span className="font-medium text-slate-700">{format(new Date(app.releaseDate), "MMM d, yyyy")}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Downloads</span>
                <span className="font-medium text-slate-700">{app.totalDownloads?.toLocaleString()}</span>
              </div>
            </div>

            {/* Install tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 text-sm mb-1.5">How to install?</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Download the APK and open it. Enable "Install from unknown sources" in your Android settings if prompted.
              </p>
              <Link href="/install-guide">
                <span className="text-xs text-primary font-medium mt-2 inline-block hover:underline">
                  View install guide →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
