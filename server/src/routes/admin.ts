import { Router, type IRouter } from "express";
import { mockApps, mockVersions, mockDownloads } from "./mockData";

const router: IRouter = Router();

const appsStore = [...mockApps];
const versionsStore = { ...mockVersions };

function requireAuth(req: any, res: any, next: any) {
  const session = req.cookies?.admin_session;
  if (!session || session !== "mock-session-token") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/admin/apps", requireAuth, async (_req, res): Promise<void> => {
  const apps = appsStore.map((app) => {
    const versions = versionsStore[app.id] ?? [];
    const totalDownloads = mockDownloads.filter((d) => d.appId === app.id).length;
    return { ...app, totalDownloads };
  });
  res.json(apps);
});

router.post("/admin/apps", requireAuth, async (req, res): Promise<void> => {
  const { name, shortDescription, fullDescription, iconUrl, isPublished } = req.body as {
    name: string;
    shortDescription: string;
    fullDescription: string;
    iconUrl?: string;
    isPublished?: boolean;
  };

  if (!name || !shortDescription || !fullDescription) {
    res.status(400).json({ error: "name, shortDescription, fullDescription are required" });
    return;
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const newApp = {
    id: `app-${Date.now()}`,
    name,
    slug,
    shortDescription,
    fullDescription,
    iconUrl: (iconUrl ?? "") as string,
    isPublished: isPublished ?? false,
    latestVersion: "" as string,
    releaseDate: "" as string,
    totalDownloads: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appsStore.push(newApp);
  versionsStore[newApp.id] = [];
  res.status(201).json(newApp);
});

router.get("/admin/apps/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const app = appsStore.find((a) => a.id === raw);

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  const totalDownloads = mockDownloads.filter((d) => d.appId === raw).length;
  res.json({ ...app, totalDownloads });
});

router.patch("/admin/apps/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const idx = appsStore.findIndex((a) => a.id === raw);

  if (idx === -1) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  const updates = req.body as Partial<{
    name: string;
    shortDescription: string;
    fullDescription: string;
    iconUrl: string;
    isPublished: boolean;
  }>;

  appsStore[idx] = {
    ...appsStore[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const totalDownloads = mockDownloads.filter((d) => d.appId === raw).length;
  res.json({ ...appsStore[idx], totalDownloads });
});

router.delete("/admin/apps/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const idx = appsStore.findIndex((a) => a.id === raw);

  if (idx === -1) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  appsStore.splice(idx, 1);
  delete versionsStore[raw];
  res.sendStatus(204);
});

router.get(
  "/admin/apps/:appId/versions",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.appId)
      ? req.params.appId[0]
      : req.params.appId;
    const versions = versionsStore[raw] ?? [];
    res.json(versions);
  }
);

router.post(
  "/admin/apps/:appId/versions",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.appId)
      ? req.params.appId[0]
      : req.params.appId;

    const app = appsStore.find((a) => a.id === raw);
    if (!app) {
      res.status(404).json({ error: "App not found" });
      return;
    }

    const {
      versionNumber,
      apkUrl,
      fileSize,
      changelog,
      isLatest,
      isPublished,
      releaseDate,
    } = req.body as {
      versionNumber: string;
      apkUrl: string;
      fileSize?: string;
      changelog?: string;
      isLatest?: boolean;
      isPublished?: boolean;
      releaseDate?: string;
    };

    if (!versionNumber || !apkUrl) {
      res.status(400).json({ error: "versionNumber and apkUrl are required" });
      return;
    }

    if (isLatest) {
      const existing = versionsStore[raw] ?? [];
      existing.forEach((v) => { v.isLatest = false; });
    }

    const newVersion = {
      id: `ver-${Date.now()}`,
      appId: raw,
      versionNumber,
      apkUrl,
      fileSize: fileSize ?? null,
      changelog: changelog ?? null,
      isLatest: isLatest ?? false,
      isPublished: isPublished ?? false,
      releaseDate: releaseDate ?? new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    if (!versionsStore[raw]) versionsStore[raw] = [];
    versionsStore[raw].unshift(newVersion);

    if (isLatest) {
      const appIdx = appsStore.findIndex((a) => a.id === raw);
      if (appIdx !== -1) {
        appsStore[appIdx] = {
          ...appsStore[appIdx],
          latestVersion: versionNumber,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    res.status(201).json(newVersion);
  }
);

router.patch(
  "/admin/versions/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    let found: (typeof mockVersions)[string][number] | undefined;
    let foundAppId: string | undefined;

    for (const [appId, versions] of Object.entries(versionsStore)) {
      const idx = versions.findIndex((v) => v.id === raw);
      if (idx !== -1) {
        foundAppId = appId;
        const updates = req.body as Partial<(typeof mockVersions)[string][number]>;
        if (updates.isLatest) {
          versions.forEach((v) => { v.isLatest = false; });
        }
        versionsStore[appId][idx] = { ...versions[idx], ...updates };
        found = versionsStore[appId][idx];
        break;
      }
    }

    if (!found) {
      res.status(404).json({ error: "Version not found" });
      return;
    }

    res.json(found);
  }
);

router.delete(
  "/admin/versions/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let deleted = false;

    for (const [appId, versions] of Object.entries(versionsStore)) {
      const idx = versions.findIndex((v) => v.id === raw);
      if (idx !== -1) {
        versionsStore[appId].splice(idx, 1);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      res.status(404).json({ error: "Version not found" });
      return;
    }

    res.sendStatus(204);
  }
);

router.get("/admin/dashboard", requireAuth, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const downloadsToday = mockDownloads.filter(
    (d) => d.downloadedAt.startsWith(today)
  ).length;

  const appDownloadCounts = mockApps.map((app) => ({
    name: app.name,
    downloads: mockDownloads.filter((d) => d.appId === app.id).length,
  }));

  const mostDownloaded = appDownloadCounts.sort((a, b) => b.downloads - a.downloads)[0];

  res.json({
    totalApps: appsStore.filter((a) => a.isPublished).length,
    totalDownloads: 4253,
    downloadsToday: 342,
    latestVersion: "v1.0.2",
    mostDownloadedApp: mostDownloaded ?? null,
    recentDownloads: mockDownloads.slice(0, 10).map((d) => ({
      id: d.id,
      appName: d.appName,
      versionNumber: d.versionNumber,
      downloadedAt: d.downloadedAt,
      userAgent: d.userAgent,
      ipAddress: d.ipAddress,
    })),
    weeklyDownloads: [
      { date: "Mon", count: 180 },
      { date: "Tue", count: 240 },
      { date: "Wed", count: 195 },
      { date: "Thu", count: 320 },
      { date: "Fri", count: 280 },
      { date: "Sat", count: 350 },
      { date: "Sun", count: 342 },
    ],
  });
});

export default router;
