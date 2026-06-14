import { Router, type IRouter } from "express";
import { mockApps, mockVersions, mockScreenshots, mockDownloads } from "./mockData";

const router: IRouter = Router();

router.get("/apps", async (req, res): Promise<void> => {
  const { search, category } = req.query as { search?: string; category?: string };
  let apps = mockApps.filter((a) => a.isPublished);

  if (search) {
    const q = search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q)
    );
  }

  res.json(apps);
});

router.get("/apps/featured", async (_req, res): Promise<void> => {
  const featured = mockApps.filter((a) => a.isPublished).slice(0, 4);
  res.json(featured);
});

router.get("/apps/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const app = mockApps.find((a) => a.slug === slug && a.isPublished);

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  const versions = mockVersions[app.id] ?? [];
  const screenshots = mockScreenshots[app.id] ?? [];
  const latestVersion = versions.find((v) => v.isLatest);

  const detail = {
    ...app,
    fullDescription: app.fullDescription,
    fileSize: latestVersion?.fileSize ?? null,
    changelog: latestVersion?.changelog ?? null,
    screenshots,
    versions,
  };

  res.json(detail);
});

router.get("/apps/:slug/versions", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const app = mockApps.find((a) => a.slug === slug && a.isPublished);

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  const versions = mockVersions[app.id] ?? [];
  res.json(versions);
});

router.post("/downloads", async (req, res): Promise<void> => {
  const { appId, versionId, userAgent, referrer } = req.body as {
    appId: string;
    versionId: string;
    userAgent?: string;
    referrer?: string;
  };

  if (!appId || !versionId) {
    res.status(400).json({ error: "appId and versionId are required" });
    return;
  }

  const download = {
    id: `d${Date.now()}`,
    appId,
    versionId,
    downloadedAt: new Date().toISOString(),
    userAgent: userAgent ?? null,
    ipAddress:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ??
      req.socket.remoteAddress ??
      null,
    referrer: referrer ?? null,
  };

  req.log.info({ appId, versionId }, "Download recorded");
  res.status(201).json(download);
});

export default router;
