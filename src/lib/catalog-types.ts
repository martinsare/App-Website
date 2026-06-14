export type GetDownloadsOverTimePeriod = "week" | "month" | "year";

export interface AppRecord {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  iconUrl?: string | null;
  featured: boolean;
  isPublished: boolean;
}

export interface VersionRecord {
  id: string;
  appId: string;
  versionNumber: string;
  apkUrl: string;
  fileSize?: string | null;
  changelog?: string | null;
  releaseDate: string;
  isLatest: boolean;
  isPublished: boolean;
}

export interface ScreenshotRecord {
  id: string;
  appId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface DownloadRecord {
  id: string;
  appId: string;
  versionId: string;
  downloadedAt: string;
  userAgent?: string | null;
  userIp?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AppSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  iconUrl?: string | null;
  featured: boolean;
  isPublished: boolean;
  latestVersion?: string | null;
  releaseDate?: string | null;
  totalDownloads?: number;
  changelog?: string | null;
}

export interface AppScreenshot {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface AppVersion {
  id: string;
  appId: string;
  versionNumber: string;
  apkUrl: string;
  fileSize?: string | null;
  changelog?: string | null;
  releaseDate: string;
  isLatest: boolean;
  isPublished: boolean;
  downloadCount: number;
}

export interface AppDetail extends AppSummary {
  versions: AppVersion[];
  screenshots: AppScreenshot[];
}

export interface DashboardWeeklyPoint {
  date: string;
  count: number;
}

export interface RecentDownload {
  id: string;
  appId: string;
  appName: string;
  versionNumber: string;
  downloadedAt: string;
  userIp?: string | null;
}

export interface DashboardStats {
  totalApps: number;
  totalDownloads: number;
  downloadsToday: number;
  weeklyDownloads: DashboardWeeklyPoint[];
  recentDownloads: RecentDownload[];
}

export interface AnalyticsSummary {
  totalDownloads: number;
  downloadsToday: number;
  downloadsThisWeek: number;
  downloadsThisMonth: number;
}

export interface TopApp {
  appId: string;
  appName: string;
  latestVersion?: string | null;
  totalDownloads: number;
}

export interface CatalogSnapshot {
  apps: AppRecord[];
  versions: VersionRecord[];
  screenshots: ScreenshotRecord[];
  downloads: DownloadRecord[];
  sessionUser: AuthUser | null;
}
