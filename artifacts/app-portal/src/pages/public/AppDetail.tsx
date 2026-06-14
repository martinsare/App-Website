import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetApp, useRecordDownload } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Clock, Calendar, HardDrive, Info } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AppDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: app, isLoading, isError } = useGetApp(slug, {
    query: {
      enabled: !!slug
    }
  });

  const recordDownload = useRecordDownload();

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
          <p className="text-muted-foreground mt-2">The requested app could not be found.</p>
        </div>
      </PublicLayout>
    );
  }

  const latestVersion = app.versions?.find(v => v.isLatest) || app.versions?.[0];

  const handleDownload = (versionId: string, url: string) => {
    recordDownload.mutate({
      data: {
        appId: app.id,
        versionId: versionId,
        userAgent: window.navigator.userAgent
      }
    });
    window.location.href = url;
  };

  return (
    <PublicLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={app.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border bg-card shadow-sm" />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border bg-card shadow-sm flex items-center justify-center text-muted-foreground">
                <Smartphone className="w-16 h-16" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">{app.name}</h1>
              <p className="text-xl text-muted-foreground mb-6">{app.shortDescription}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {latestVersion && (
                  <Button size="lg" onClick={() => handleDownload(latestVersion.id, latestVersion.apkUrl)}>
                    <Download className="w-5 h-5 mr-2" />
                    Download APK (v{latestVersion.versionNumber})
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{app.totalDownloads?.toLocaleString()} downloads</span>
                </div>
                {app.releaseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {format(new Date(app.releaseDate), "MMM d, yyyy")}</span>
                  </div>
                )}
                {app.fileSize && (
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    <span>{app.fileSize}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Screenshots */}
            {app.screenshots && app.screenshots.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {app.screenshots.map((shot) => (
                      <CarouselItem key={shot.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <img src={shot.imageUrl} alt="Screenshot" className="rounded-xl border shadow-sm aspect-[9/16] object-cover w-full bg-muted" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </section>
            )}

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-6">About this app</h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {app.fullDescription || app.shortDescription}
              </div>
            </section>

            {/* Changelog */}
            {app.changelog && (
              <section>
                <h2 className="text-2xl font-bold mb-6">What's New</h2>
                <div className="bg-muted/50 p-6 rounded-xl border prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                  {app.changelog}
                </div>
              </section>
            )}
            
            {/* Version History */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Version History</h2>
              <div className="border rounded-xl overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {app.versions?.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell className="font-mono font-medium">
                          {version.versionNumber}
                          {version.isLatest && <Badge className="ml-2" variant="secondary">Latest</Badge>}
                        </TableCell>
                        <TableCell>
                          {format(new Date(version.releaseDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {version.fileSize || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(version.id, version.apkUrl)}>
                            <Download className="w-4 h-4 mr-2" /> Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!app.versions?.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No versions available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How to install?</AlertTitle>
              <AlertDescription>
                Download the APK file and open it. You may need to enable "Install from unknown sources" in your Android settings.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
