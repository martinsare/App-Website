import { Router, type IRouter } from "express";
import { mockApps, mockDownloads, mockWeeklyDownloads, mockMonthlyDownloads } from "./mockData";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const session = req.cookies?.admin_session;
  if (!session || session !== "mock-session-token") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get(
  "/admin/analytics/summary",
  requireAuth,
  async (_req, res): Promise<void> => {
    res.json({
      totalDownloads: 4253,
      downloadsToday: 342,
      downloadsThisWeek: 1892,
      downloadsThisMonth: 4253,
      totalApps: mockApps.filter((a) => a.isPublished).length,
    });
  }
);

router.get(
  "/admin/analytics/downloads-over-time",
  requireAuth,
  async (req, res): Promise<void> => {
    const { period } = req.query as { period?: string };

    if (period === "month") {
      res.json(mockMonthlyDownloads);
      return;
    }

    res.json(mockWeeklyDownloads);
  }
);

router.get(
  "/admin/analytics/top-apps",
  requireAuth,
  async (_req, res): Promise<void> => {
    const totalAll = mockApps.reduce((s, a) => s + a.totalDownloads, 0) || 1;

    const topApps = mockApps
      .filter((a) => a.isPublished)
      .sort((a, b) => b.totalDownloads - a.totalDownloads)
      .map((app) => ({
        appId: app.id,
        appName: app.name,
        iconUrl: app.iconUrl,
        totalDownloads: app.totalDownloads,
        percentage: Math.round((app.totalDownloads / totalAll) * 100),
      }));

    res.json(topApps);
  }
);

router.get(
  "/admin/analytics/recent-downloads",
  requireAuth,
  async (_req, res): Promise<void> => {
    const recent = mockDownloads.map((d) => ({
      id: d.id,
      appName: d.appName,
      versionNumber: d.versionNumber,
      downloadedAt: d.downloadedAt,
      userAgent: d.userAgent ?? null,
      ipAddress: d.ipAddress ?? null,
    }));

    res.json(recent);
  }
);

export default router;
