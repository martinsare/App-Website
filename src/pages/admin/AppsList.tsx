import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListApps, useDeleteApp } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, List, Smartphone } from "lucide-react";
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Apps</h1>
          <p className="text-slate-500 text-sm mt-0.5">Showing {apps?.length ?? 0} of {apps?.length ?? 0} apps</p>
        </div>
        <Link href="/admin/apps/new">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New App
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">App</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Latest Version</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Downloads</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
            ) : apps?.length ? (
              apps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-800">{app.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{app.shortDescription}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-600">
                    v{app.latestVersion || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {app.totalDownloads?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    {app.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/apps/${app.id}/versions`}>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Versions">
                          <List className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/apps/${app.id}/edit`}>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(app.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  No apps yet. Click "Add New App" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
