import { PublicLayout } from "@/components/layout/PublicLayout";
import { Download, ShieldCheck, Settings, Smartphone } from "lucide-react";

export default function InstallGuide() {
  return (
    <PublicLayout>
      <div className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How to Install APKs</h1>
          <p className="text-lg text-muted-foreground">Follow these simple steps to install apps directly to your Android device.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-none">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">1</div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Download the APK
              </h3>
              <p className="text-muted-foreground mb-4">
                Find the app you want on AMK Apps and tap the Download button. Your browser may warn you about downloading APK files — tap "Download anyway" to proceed.
              </p>
              <div className="bg-muted p-4 rounded-lg border">
                <p className="text-sm font-medium">Note: Our APKs are scanned and guaranteed safe.</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-none">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">2</div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Allow Unknown Sources
              </h3>
              <p className="text-muted-foreground mb-4">
                Before installing, you need to allow your browser or file manager to install apps.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Go to Android <strong>Settings</strong></li>
                <li>Navigate to <strong>Apps & Notifications</strong> or <strong>Security</strong></li>
                <li>Find <strong>Install unknown apps</strong> or <strong>Unknown sources</strong></li>
                <li>Select your browser (e.g., Chrome) and toggle <strong>Allow from this source</strong></li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-none">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">3</div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Install the App
              </h3>
              <p className="text-muted-foreground mb-4">
                Open your downloads folder or tap the notification when the download finishes. Tap the APK file and select <strong>Install</strong> when prompted.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex-none">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">4</div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Open & Enjoy
              </h3>
              <p className="text-muted-foreground mb-4">
                Once the installation is complete, you can tap <strong>Open</strong> to launch the app immediately, or find it in your app drawer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
