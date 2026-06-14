import { AdminLayout } from "@/components/layout/AdminLayout";
import { useCreateApp, useUpdateApp, useAdminGetApp, getAdminGetAppQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const appSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  fullDescription: z.string().min(1, "Full description is required"),
  iconUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

type AppFormValues = z.infer<typeof appSchema>;

export default function AppForm() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  const queryClient = useQueryClient();

  const { data: existingApp, isLoading } = useAdminGetApp(id, {
    query: { enabled: isEditing, queryKey: getAdminGetAppQueryKey(id) }
  });

  const createApp = useCreateApp();
  const updateApp = useUpdateApp();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AppFormValues>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      fullDescription: "",
      iconUrl: "",
      isPublished: false,
    }
  });

  useEffect(() => {
    if (existingApp && isEditing) {
      setValue("name", existingApp.name);
      setValue("shortDescription", existingApp.shortDescription);
      setValue("fullDescription", existingApp.fullDescription);
      setValue("iconUrl", existingApp.iconUrl || "");
      setValue("isPublished", existingApp.isPublished);
    }
  }, [existingApp, isEditing, setValue]);

  const isPublished = watch("isPublished");

  const onSubmit = async (data: AppFormValues) => {
    try {
      if (isEditing) {
        await updateApp.mutateAsync({ id, data });
        queryClient.invalidateQueries({ queryKey: getAdminGetAppQueryKey(id) });
      } else {
        await createApp.mutateAsync({ data });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      setLocation("/admin/apps");
    } catch (error) {
      console.error(error);
    }
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit App" : "Add New App"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update application details." : "Create a new application entry."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="name">App Name</Label>
              <Input id="name" {...register("name")} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" {...register("shortDescription")} className={errors.shortDescription ? "border-destructive" : ""} />
              <p className="text-xs text-muted-foreground">A brief summary shown in app cards.</p>
              {errors.shortDescription && <p className="text-sm text-destructive">{errors.shortDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Full Description</Label>
              <Textarea 
                id="fullDescription" 
                {...register("fullDescription")} 
                className={`min-h-[150px] ${errors.fullDescription ? "border-destructive" : ""}`} 
              />
              {errors.fullDescription && <p className="text-sm text-destructive">{errors.fullDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconUrl">Icon URL (optional)</Label>
              <Input id="iconUrl" type="url" placeholder="https://..." {...register("iconUrl")} className={errors.iconUrl ? "border-destructive" : ""} />
              {errors.iconUrl && <p className="text-sm text-destructive">{errors.iconUrl.message}</p>}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Published Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this app visible on the public portal.
                </p>
              </div>
              <Switch 
                checked={isPublished} 
                onCheckedChange={(val) => setValue("isPublished", val)} 
              />
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/apps")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create App"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
