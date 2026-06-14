import { PublicLayout } from "@/components/layout/PublicLayout";
import { Download, Settings, FolderOpen, Smartphone, PartyPopper } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Download,
    title: "Download the APK",
    description: "Tap on install and wait for the system to download the APK file to your device.",
    color: "bg-green-100 text-green-600",
    iconBg: "bg-green-500",
  },
  {
    number: 2,
    icon: Settings,
    title: "Allow Unknown Apps",
    description: "Go to Settings > Security > Install unknown apps and allow your browser or file manager.",
    color: "bg-blue-100 text-blue-600",
    iconBg: "bg-blue-500",
  },
  {
    number: 3,
    icon: FolderOpen,
    title: "Open the APK File",
    description: "Navigate to the downloaded APK file in your Downloads folder and tap on it.",
    color: "bg-orange-100 text-orange-600",
    iconBg: "bg-orange-500",
  },
  {
    number: 4,
    icon: Smartphone,
    title: "Install the App",
    description: "Tap Install and wait for the installation to complete.",
    color: "bg-purple-100 text-purple-600",
    iconBg: "bg-purple-500",
  },
  {
    number: 5,
    icon: PartyPopper,
    title: "Open and Enjoy",
    description: "Once installed, open the app and enjoy all the features!",
    color: "bg-pink-100 text-pink-600",
    iconBg: "bg-pink-500",
  },
];

export default function InstallGuide() {
  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-[#0b1426] py-12 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">How to Install</h1>
          <p className="text-slate-400">Follow these simple steps to install any APK on your Android device.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-5 bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              {/* Number circle */}
              <div className={`w-10 h-10 rounded-full ${step.iconBg} text-white flex items-center justify-center font-bold text-base shrink-0`}>
                {step.number}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  <step.icon className={`w-4 h-4 ${step.color.split(' ')[1]}`} />
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Important note */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-amber-600 text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Important Note</h4>
              <p className="text-sm text-amber-700">
                Since our apps are not on the Google Play Store, you may see a warning saying "Unknown apps are not safe." Don't worry — our apps are safe and verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
