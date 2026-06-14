import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListApps, useCreateVersion, getAdminListVersionsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, CloudUpload } from "lucide-react";

const versionSchema = z.object({
  appId: z.string().min(1, "App selection is required"),
  versionNumber: z.string().min(1, "Version number is required"),
  apkUrl: z.string().url("Must be a valid URL"),
  fileSize: z.string().optional(),
  changelog: z.string().optional(),
  isLatest: z.boolean().default(true),
  isPublished: z.boolean().default(true),
});

type VersionFormValues = z.infer<typeof versionSchema>;

export default function UploadVersion() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialAppId = searchParams.get("appId") || "";

  const { data: apps } = useAdminListApps();
  const createVersion = useCreateVersion();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      appId: initialAppId,
      versionNumber: "",
      apkUrl: "",
      fileSize: "",
      changelog: "",
      isLatest: true,
      isPublished: true,
    }
  });

  const appId = watch("appId");
  const isLatest = watch("isLatest");
  const isPublished = watch("isPublished");

  const onSubmit = async (data: VersionFormValues) => {
    try {
      const { appId: aid, ...versionData } = data;
      await createVersion.mutateAsync({ appId: aid, data: versionData });
      queryClient.invalidateQueries({ queryKey: getAdminListVersionsQueryKey(aid) });
      setLocation(`/admin/apps/${aid}/versions`);
    } catch (error) {
      // handled by mutation
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Upload New Version</h1>
        <p className="text-slate-500 text-sm mt-0.5">Release a new version of an existing app.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* App selector */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Select App</Label>
              <Select value={appId} onValueChange={(val) => setValue("appId", val)}>
                <SelectTrigger className={`w-full ${errors.appId ? "border-red-400" : ""}`}>
                  <SelectValue placeholder="Choose an app..." />
                </SelectTrigger>
                <SelectContent>
                  {apps?.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appId && <p className="text-xs text-red-500 mt-1.5">{errors.appId.message}</p>}
            </div>

            {/* Version info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Version Details</h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Version Number</Label>
                <Input
                  placeholder="e.g. 1.0.4"
                  {...register("versionNumber")}
                  className={errors.versionNumber ? "border-red-400" : ""}
                />
                {errors.versionNumber && <p className="text-xs text-red-500">{errors.versionNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Changelog / What's New</Label>
                <Textarea
                  placeholder="• Added dark mode&#10;• Improved performance&#10;• Fixed minor bugs"
                  {...register("changelog")}
                  className="min-h-[100px] text-sm"
                />
              </div>
            </div>

            {/* APK file */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Upload APK File</h3>

              {/* Upload area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer">
                <CloudUpload className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">APK files only</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">APK URL</Label>
                <Input
                  type="url"
                  placeholder="https://storage.example.com/app.apk"
                  {...register("apkUrl")}
                  className={errors.apkUrl ? "border-red-400" : ""}
                />
                {errors.apkUrl && <p className="text-xs text-red-500">{errors.apkUrl.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">File Size</Label>
                  <Input placeholder="e.g. 15.6 MB" {...register("fileSize")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Release Date</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} disabled className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Mark as latest version</p>
                  <p className="text-xs text-slate-400">Sets this as the default download</p>
                </div>
                <Switch checked={isLatest} onCheckedChange={(val) => setValue("isLatest", val)} />
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Publish immediately</p>
                  <p className="text-xs text-slate-400">Make visible to users right away</p>
                </div>
                <Switch checked={isPublished} onCheckedChange={(val) => setValue("isPublished", val)} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/apps")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white">
                <Upload className="w-4 h-4 mr-2" />
                {isSubmitting ? "Uploading..." : "Upload & Publish"}
              </Button>
            </div>
          </form>
        </div>

        {/* Side info */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li>• Use semantic versioning (e.g. 1.2.3)</li>
              <li>• Host your APK on a reliable CDN or storage service</li>
              <li>• Include clear changelogs for users</li>
              <li>• Mark as latest to make it the default download</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
