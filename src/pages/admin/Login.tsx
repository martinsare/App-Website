import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Smartphone, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const nextPath = searchParams.get("next") || "/admin/dashboard";
  const login = useAdminLogin();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login.mutateAsync({ data });
      setLocation(nextPath);
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl text-primary-foreground">
              <Smartphone className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
          <CardDescription>Use your account to access the admin portal and protected downloads.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@amkapps.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 text-sm text-muted-foreground">
          <button type="button" onClick={() => setLocation("/")} className="hover:text-primary transition-colors">
            Return to public site
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
