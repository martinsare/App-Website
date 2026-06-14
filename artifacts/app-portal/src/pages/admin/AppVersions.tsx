import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetApp, useAdminListVersions, useDeleteVersion, getAdminListVersionsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, ChevronLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function AppVersions() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: app } = useAdminGetApp(id, { query: { enabled: !!id } });
  const { data: versions, isLoading } = useAdminListVersions(id, { query: { enabled: !!id, queryKey: getAdminListVersionsQueryKey(id) } });
  const deleteVersion = useDeleteVersion();

  const handleDelete = async (versionId: string) => {
    if (window.confirm("Are you sure you want to delete this version?")) {
      await deleteVersion.mutateAsync({ id: versionId });
      queryClient.invalidateQueries({ queryKey: getAdminListVersionsQueryKey(id) });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/apps" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4 inline-flex">
          <ChevronLeft className="w-4 h-4" /> Back to Apps
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Versions</h1>
            <p className="text-muted-foreground">Manage versions for <span className="font-semibold">{app?.name || "..."}</span></p>
          </div>
          <Link href={`/admin/upload?appId=${id}`}>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Version
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading versions...
                </TableCell>
              </TableRow>
            ) : versions?.length ? (
              versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-mono font-medium">
                    {version.versionNumber}
                    {version.isLatest && <Badge className="ml-2" variant="secondary">Latest</Badge>}
                  </TableCell>
                  <TableCell>{format(new Date(version.releaseDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{version.fileSize || "N/A"}</TableCell>
                  <TableCell>
                    {version.isPublished ? (
                      <span className="text-primary text-sm">Published</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Draft</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(version.id)} title="Delete Version">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No versions found. Upload one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
