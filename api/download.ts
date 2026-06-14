import { createClient } from "@supabase/supabase-js";
import { Readable } from "node:stream";

const APK_BUCKET = "apks";

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : null;
}

function getFilename(apkPath: string, versionNumber: string) {
  const candidate = apkPath.split("/").pop()?.trim();
  if (candidate) return candidate;
  return `app-${versionNumber}.apk`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const versionId = String(req.query?.versionId ?? "").trim();
  if (!versionId) {
    return res.status(400).json({ error: "Missing versionId." });
  }

  const supabaseUrl = getEnv("SUPABASE_URL") ?? getEnv("VITE_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      error: "Download service is not configured.",
    });
  }

  const authHeader = String(req.headers?.authorization ?? "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Sign in required to download this APK." });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ error: "Sign in required to download this APK." });
  }

  const { data: version, error: versionError } = await supabase
    .from("versions")
    .select("id, app_id, version_number, apk_path, is_published")
    .eq("id", versionId)
    .maybeSingle();

  if (versionError) {
    return res.status(500).json({ error: versionError.message });
  }

  if (!version) {
    return res.status(404).json({ error: "Version not found." });
  }

  const apkPath = String(version.apk_path ?? "").trim();
  if (!apkPath) {
    return res.status(404).json({ error: "APK path not found." });
  }

  let downloadUrl = apkPath;
  if (!isAbsoluteUrl(apkPath)) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(APK_BUCKET)
      .createSignedUrl(apkPath, 120);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return res.status(500).json({ error: signedUrlError?.message ?? "Unable to prepare download." });
    }

    downloadUrl = signedUrlData.signedUrl;
  }

  const remoteResponse = await fetch(downloadUrl);
  if (!remoteResponse.ok || !remoteResponse.body) {
    return res.status(502).json({ error: "Unable to stream APK." });
  }

  const contentType = remoteResponse.headers.get("content-type") ?? "application/vnd.android.package-archive";
  const contentLength = remoteResponse.headers.get("content-length");
  const filename = getFilename(apkPath, String(version.version_number ?? "download"));

  res.status(200);
  res.setHeader("Content-Type", contentType);
  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(/"/g, '\\"')}"`);

  const stream = Readable.fromWeb(remoteResponse.body as any);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(502);
    }
    res.end();
  });
  stream.pipe(res);
}
