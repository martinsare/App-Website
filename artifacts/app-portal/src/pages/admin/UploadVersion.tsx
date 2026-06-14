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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

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
      const { appId, ...versionData } = data;
      await createVersion.mutateAsync({ 
        appId, 
        data: versionData
      });
      queryClient.invalidateQueries({ queryKey: getAdminListVersionsQueryKey(appId) });
      setLocation(`/admin/apps/${appId}/versions`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Version</h1>
        <p className="text-muted-foreground">Release a new version of an app.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label>Select App</Label>
              <Select value={appId} onValueChange={(val) => setValue("appId", val)}>
                <SelectTrigger className={errors.appId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select an app" />
                </SelectTrigger>
                <SelectContent>
                  {apps?.map(app => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appId && <p className="text-sm text-destructive">{errors.appId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versionNumber">Version Number</Label>
                <Input id="versionNumber" placeholder="e.g. 1.0.4" {...register("versionNumber")} className={errors.versionNumber ? "border-destructive" : ""} />
                {errors.versionNumber && <p className="text-sm text-destructive">{errors.versionNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileSize">File Size</Label>
                <Input id="fileSize" placeholder="e.g. 45 MB" {...register("fileSize")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apkUrl">APK URL</Label>
              <Input id="apkUrl" type="url" placeholder="https://..." {...register("apkUrl")} className={errors.apkUrl ? "border-destructive" : ""} />
              {errors.apkUrl && <p className="text-sm text-destructive">{errors.apkUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="changelog">Changelog</Label>
              <Textarea 
                id="changelog" 
                placeholder="What's new in this version?"
                {...register("changelog")} 
                className="min-h-[100px]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Mark as Latest</Label>
                </div>
                <Switch 
                  checked={isLatest} 
                  onCheckedChange={(val) => setValue("isLatest", val)} 
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Published</Label>
                </div>
                <Switch 
                  checked={isPublished} 
                  onCheckedChange={(val) => setValue("isPublished", val)} 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/apps")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload & Publish"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
