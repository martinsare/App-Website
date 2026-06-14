import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListApps, useDeleteApp } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, List } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminAppsList() {
  const { data: apps, isLoading } = useAdminListApps();
  const deleteApp = useDeleteApp();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this app?")) {
      await deleteApp.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apps</h1>
          <p className="text-muted-foreground">Manage your published and draft applications.</p>
        </div>
        <Link href="/admin/apps/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New App
          </Button>
        </Link>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Latest Version</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading apps...
                </TableCell>
              </TableRow>
            ) : apps?.length ? (
              apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {app.iconUrl && <img src={app.iconUrl} alt="" className="w-8 h-8 rounded border bg-muted object-cover" />}
                      {app.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {app.latestVersion || "None"}
                  </TableCell>
                  <TableCell>{app.totalDownloads?.toLocaleString()}</TableCell>
                  <TableCell>
                    {app.isPublished ? (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/apps/${app.id}/versions`}>
                        <Button variant="ghost" size="icon" title="Manage Versions">
                          <List className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/apps/${app.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit App">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(app.id)} title="Delete App">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No apps found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
