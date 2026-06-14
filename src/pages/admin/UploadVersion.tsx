import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListApps, useCreateVersion, getAdminListVersionsQueryKey } from "@workspace/api-client-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, type ChangeEvent } from "react";
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
  fileSize: z.string().optional(),
  changelog: z.string().optional(),
  isLatest: z.boolean().default(true),
  isPublished: z.boolean().default(true),
});

type VersionFormValues = z.infer<typeof versionSchema>;

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 1 : 2)} MB`;
}

function buildStoragePath(appId: string, versionNumber: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return `versions/${appId || "app"}/${versionNumber || "version"}/${Date.now()}-${safeName}`;
}

export default function UploadVersion() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialAppId = searchParams.get("appId") || "";

  const { data: apps } = useAdminListApps();
  const createVersion = useCreateVersion();
  const queryClient = useQueryClient();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      appId: initialAppId,
      versionNumber: "",
      fileSize: "",
      changelog: "",
      isLatest: true,
      isPublished: true,
    }
  });

  const appId = watch("appId");
  const isLatest = watch("isLatest");
  const isPublished = watch("isPublished");
  const fileSize = watch("fileSize");

  const handleApkSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setValue("fileSize", formatBytes(file.size), { shouldValidate: true });
  };

  const onSubmit = async (data: VersionFormValues) => {
    try {
      const { appId: aid, ...versionData } = data;
      if (!selectedFile) {
        throw new Error("Please choose an APK file first.");
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const storagePath = buildStoragePath(aid, data.versionNumber, selectedFile.name);

      const { error: uploadError } = await supabase.storage.from("apks").upload(storagePath, selectedFile, {
        contentType: selectedFile.type || "application/vnd.android.package-archive",
        upsert: false,
      });

      if (uploadError) {
        throw uploadError;
      }

      await createVersion.mutateAsync({ appId: aid, data: { ...versionData, apkUrl: storagePath } });
      queryClient.invalidateQueries({ queryKey: getAdminListVersionsQueryKey(aid) });
      setLocation(`/admin/apps/${aid}/versions`);
    } catch (error) {
      console.error(error);
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
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer">
                <CloudUpload className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">APK files only</p>
                <input
                  type="file"
                  accept=".apk,application/vnd.android.package-archive"
                  className="hidden"
                  onChange={handleApkSelect}
                />
              </label>

              {selectedFileName && (
                <p className="text-xs text-slate-500">
                  Selected file: <span className="font-medium text-slate-700">{selectedFileName}</span>
                </p>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">APK Path</Label>
                <Input
                  value={selectedFileName ? buildStoragePath(appId, watch("versionNumber"), selectedFileName) : ""}
                  readOnly
                  className="bg-slate-50"
                  placeholder="Will be uploaded to Supabase Storage"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">File Size</Label>
                  <Input
                    placeholder="Auto-generated from file"
                    value={fileSize || ""}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Release Date</Label>
                  <Input
                    type="text"
                    value={new Date().toLocaleDateString()}
                    readOnly
                    className="bg-slate-50 text-slate-500"
                  />
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
