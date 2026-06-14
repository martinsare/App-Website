import { useMutation, useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import { isWithinInterval, parseISO, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { getSupabaseClient } from "./supabase";
import type {
  AnalyticsSummary,
  AppDetail,
  AppRecord,
  AppScreenshot,
  AppSummary,
  AppVersion,
  AuthUser,
  CatalogSnapshot,
  DashboardStats,
  DownloadRecord,
  GetDownloadsOverTimePeriod,
  RecentDownload,
  ScreenshotRecord,
  TopApp,
  TopVersion,
  VersionRecord,
} from "./catalog-types";

type QueryOpts<TData> = {
  query?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, "queryKey" | "queryFn"> & {
    queryKey?: QueryKey;
  };
};

type LoginInput = { email: string; password: string };
type AppInput = {
  name: string;
  shortDescription: string;
  fullDescription: string;
  iconUrl?: string;
  isPublished: boolean;
};
type VersionInput = {
  versionNumber: string;
  apkUrl: string;
  fileSize?: string;
  changelog?: string;
  isLatest: boolean;
  isPublished: boolean;
};
type RecordDownloadInput = {
  appId: string;
  versionId: string;
  userAgent?: string;
  userIp?: string;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  icon_url: string | null;
  featured: boolean;
  is_published: boolean;
};

type VersionRow = {
  id: string;
  app_id: string;
  version_number: string;
  apk_path: string;
  file_size: string | null;
  changelog: string | null;
  release_date: string;
  is_latest: boolean;
  is_published: boolean;
};

type ScreenshotRow = {
  id: string;
  app_id: string;
  image_url: string;
  sort_order: number;
};

type DownloadRow = {
  id: string;
  app_id: string;
  version_id: string;
  downloaded_at: string;
  user_agent: string | null;
  user_ip: string | null;
};

const emptySnapshot: CatalogSnapshot = {
  apps: [],
  versions: [],
  screenshots: [],
  downloads: [],
  sessionUser: null,
};

const APK_BUCKET = "apks";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyIfMissingClient(): CatalogSnapshot {
  return emptySnapshot;
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function buildApkUrl(apkPath: string) {
  if (isAbsoluteUrl(apkPath)) return apkPath;

  const supabase = getSupabaseClient();
  if (!supabase) return apkPath;

  return apkPath;
}

function normalizeApkSource(apkUrl: string) {
  if (isAbsoluteUrl(apkUrl)) return apkUrl;
  return buildApkUrl(apkUrl);
}

function mapAppRow(row: AppRow): AppRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    iconUrl: row.icon_url,
    featured: Boolean(row.featured),
    isPublished: Boolean(row.is_published),
  };
}

function mapVersionRow(row: VersionRow): VersionRecord {
  return {
    id: row.id,
    appId: row.app_id,
    versionNumber: row.version_number,
    apkUrl: normalizeApkSource(row.apk_path),
    fileSize: row.file_size,
    changelog: row.changelog,
    releaseDate: row.release_date,
    isLatest: Boolean(row.is_latest),
    isPublished: Boolean(row.is_published),
  };
}

function mapScreenshotRow(row: ScreenshotRow): ScreenshotRecord {
  return {
    id: row.id,
    appId: row.app_id,
    imageUrl: row.image_url,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapDownloadRow(row: DownloadRow): DownloadRecord {
  return {
    id: row.id,
    appId: row.app_id,
    versionId: row.version_id,
    downloadedAt: row.downloaded_at,
    userAgent: row.user_agent,
    userIp: row.user_ip,
  };
}

function normalizeAppSummary(
  app: AppRecord,
  versions: VersionRecord[],
  downloads: DownloadRecord[],
  publicView: boolean,
): AppSummary {
  const appVersions = versions
    .filter((version) => version.appId === app.id)
    .filter((version) => (publicView ? version.isPublished : true))
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  const latest = appVersions.find((version) => version.isLatest) ?? appVersions[0];

  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    shortDescription: app.shortDescription,
    fullDescription: app.fullDescription,
    iconUrl: app.iconUrl,
    featured: app.featured,
    isPublished: app.isPublished,
    latestVersion: latest?.versionNumber ?? null,
    releaseDate: latest?.releaseDate ?? null,
    totalDownloads: downloads.filter((download) => download.appId === app.id).length,
    changelog: latest?.changelog ?? null,
  };
}

function normalizeAppDetail(
  app: AppRecord,
  versions: VersionRecord[],
  screenshots: ScreenshotRecord[],
  downloads: DownloadRecord[],
  publicView: boolean,
): AppDetail {
  const summary = normalizeAppSummary(app, versions, downloads, publicView);
  const appVersions = versions
    .filter((version) => version.appId === app.id)
    .filter((version) => (publicView ? version.isPublished : true))
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .map((version) => ({
      id: version.id,
      appId: version.appId,
      versionNumber: version.versionNumber,
      apkUrl: version.apkUrl,
      fileSize: version.fileSize ?? null,
      changelog: version.changelog ?? null,
      releaseDate: version.releaseDate,
      isLatest: version.isLatest,
      isPublished: version.isPublished,
      downloadCount: downloads.filter((download) => download.versionId === version.id).length,
    }));

  const appScreenshots = screenshots
    .filter((shot) => shot.appId === app.id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((shot) => ({
      id: shot.id,
      imageUrl: shot.imageUrl,
      sortOrder: shot.sortOrder,
    }));

  return {
    ...summary,
    versions: appVersions,
    screenshots: appScreenshots,
  };
}

function aggregateTopApps(snapshot: CatalogSnapshot): TopApp[] {
  return snapshot.apps
    .map((app) => {
      const versions = snapshot.versions.filter((version) => version.appId === app.id);
      const latest = versions
        .slice()
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())[0];
      return {
        appId: app.id,
        appName: app.name,
        latestVersion: latest?.versionNumber ?? null,
        totalDownloads: snapshot.downloads.filter((download) => download.appId === app.id).length,
      };
    })
    .sort((a, b) => b.totalDownloads - a.totalDownloads);
}

function aggregateTopVersions(snapshot: CatalogSnapshot): TopVersion[] {
  return snapshot.versions
    .map((version) => {
      const app = snapshot.apps.find((item) => item.id === version.appId);
      return {
        versionId: version.id,
        appId: version.appId,
        appName: app?.name ?? "Unknown App",
        versionNumber: version.versionNumber,
        totalDownloads: snapshot.downloads.filter((download) => download.versionId === version.id).length,
      };
    })
    .sort((a, b) => b.totalDownloads - a.totalDownloads);
}

function getRecentDownloads(snapshot: CatalogSnapshot): RecentDownload[] {
  return snapshot.downloads
    .slice()
    .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
    .slice(0, 10)
    .map((download) => {
      const app = snapshot.apps.find((item) => item.id === download.appId);
      const version = snapshot.versions.find((item) => item.id === download.versionId);
      return {
        id: download.id,
        appId: download.appId,
        appName: app?.name ?? "Unknown App",
        versionNumber: version?.versionNumber ?? "0.0.0",
        downloadedAt: download.downloadedAt,
        userIp: download.userIp ?? null,
      };
    });
}

function buildWeeklyDownloads(snapshot: CatalogSnapshot) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = subDays(today, 6 - index);
    const start = startOfDay(day);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return {
      date: start.toISOString(),
      count: snapshot.downloads.filter((download) => {
        const downloadedAt = parseISO(download.downloadedAt);
        return downloadedAt >= start && downloadedAt < end;
      }).length,
    };
  });
}

function summarizeDownloads(snapshot: CatalogSnapshot): AnalyticsSummary {
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = subDays(dayStart, 6);
  const monthStart = subMonths(dayStart, 1);

  const totalDownloads = snapshot.downloads.length;
  const downloadsToday = snapshot.downloads.filter((download) =>
    isWithinInterval(parseISO(download.downloadedAt), { start: dayStart, end: now }),
  ).length;
  const downloadsThisWeek = snapshot.downloads.filter((download) =>
    isWithinInterval(parseISO(download.downloadedAt), { start: weekStart, end: now }),
  ).length;
  const downloadsThisMonth = snapshot.downloads.filter((download) =>
    isWithinInterval(parseISO(download.downloadedAt), { start: monthStart, end: now }),
  ).length;

  return {
    totalDownloads,
    downloadsToday,
    downloadsThisWeek,
    downloadsThisMonth,
  };
}

function filterPublicApps(snapshot: CatalogSnapshot, search?: string) {
  const term = search?.trim().toLowerCase();
  return snapshot.apps
    .filter((app) => app.isPublished)
    .filter((app) => {
      if (!term) return true;
      return [app.name, app.shortDescription, app.fullDescription].some((value) =>
        value.toLowerCase().includes(term),
      );
    })
    .map((app) => normalizeAppSummary(app, snapshot.versions, snapshot.downloads, true))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
}

function filterAdminApps(snapshot: CatalogSnapshot) {
  return snapshot.apps
    .map((app) => normalizeAppSummary(app, snapshot.versions, snapshot.downloads, false))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return emptyIfMissingClient();
  }

  const [appsRes, versionsRes, screenshotsRes, downloadsRes] = await Promise.all([
    supabase.from("apps").select("*").order("name", { ascending: true }),
    supabase.from("versions").select("*").order("release_date", { ascending: false }),
    supabase.from("screenshots").select("*").order("sort_order", { ascending: true }),
    supabase.from("downloads").select("*").order("downloaded_at", { ascending: false }),
  ]);

  const error = appsRes.error ?? versionsRes.error ?? screenshotsRes.error ?? downloadsRes.error;
  if (error) {
    throw error;
  }

  return {
    apps: ((appsRes.data ?? []) as AppRow[]).map(mapAppRow),
    versions: ((versionsRes.data ?? []) as VersionRow[]).map(mapVersionRow),
    screenshots: ((screenshotsRes.data ?? []) as ScreenshotRow[]).map(mapScreenshotRow),
    downloads: ((downloadsRes.data ?? []) as DownloadRow[]).map(mapDownloadRow),
    sessionUser: null,
  };
}

async function getMe(): Promise<AuthUser | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
}

async function login(input: LoginInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    throw error ?? new Error("Invalid credentials");
  }

  return { id: data.user.id, email: data.user.email ?? input.email };
}

async function logout() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

async function createApp(input: AppInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const payload = {
    slug: createSlug(input.name),
    name: input.name,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    icon_url: input.iconUrl || null,
    featured: false,
    is_published: input.isPublished,
  };

  const { data, error } = await supabase.from("apps").insert(payload).select("*").single();
  if (error || !data) {
    throw error ?? new Error("Unable to create app");
  }

  const snapshot = await loadCatalogSnapshot();
  const app = mapAppRow(data as AppRow);
  return normalizeAppSummary(app, snapshot.versions, snapshot.downloads, false);
}

async function updateApp(id: string, input: AppInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const payload = {
    slug: createSlug(input.name),
    name: input.name,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    icon_url: input.iconUrl || null,
    is_published: input.isPublished,
  };

  const { data, error } = await supabase.from("apps").update(payload).eq("id", id).select("*").single();
  if (error || !data) {
    throw error ?? new Error("App not found");
  }

  const snapshot = await loadCatalogSnapshot();
  const app = mapAppRow(data as AppRow);
  return normalizeAppSummary(app, snapshot.versions, snapshot.downloads, false);
}

async function deleteApp(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

async function createVersion(appId: string, input: VersionInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const appCheck = await supabase.from("apps").select("id").eq("id", appId).maybeSingle();
  if (appCheck.error) throw appCheck.error;
  if (!appCheck.data) throw new Error("App not found");

  if (input.isLatest) {
    const clearLatest = await supabase.from("versions").update({ is_latest: false }).eq("app_id", appId);
    if (clearLatest.error) throw clearLatest.error;
  }

  const payload = {
    app_id: appId,
    version_number: input.versionNumber,
    apk_path: input.apkUrl,
    file_size: input.fileSize ?? null,
    changelog: input.changelog ?? null,
    release_date: new Date().toISOString(),
    is_latest: input.isLatest,
    is_published: input.isPublished,
  };

  const { data, error } = await supabase.from("versions").insert(payload).select("*").single();
  if (error || !data) {
    throw error ?? new Error("Unable to create version");
  }

  const version = mapVersionRow(data as VersionRow);
  return {
    id: version.id,
    appId: version.appId,
    versionNumber: version.versionNumber,
    apkUrl: version.apkUrl,
    fileSize: version.fileSize ?? null,
    changelog: version.changelog ?? null,
    releaseDate: version.releaseDate,
    isLatest: version.isLatest,
    isPublished: version.isPublished,
    downloadCount: 0,
  } satisfies AppVersion;
}

async function deleteVersion(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const versionRes = await supabase.from("versions").select("*").eq("id", id).maybeSingle();
  if (versionRes.error) throw versionRes.error;
  if (!versionRes.data) throw new Error("Version not found");

  const deleteRes = await supabase.from("versions").delete().eq("id", id);
  if (deleteRes.error) throw deleteRes.error;

  if (versionRes.data.is_latest) {
    const remaining = await supabase
      .from("versions")
      .select("*")
      .eq("app_id", versionRes.data.app_id)
      .order("release_date", { ascending: false });

    if (remaining.error) throw remaining.error;

    const nextLatest = (remaining.data ?? [])[0] as VersionRow | undefined;
    if (nextLatest) {
      const updateRes = await supabase.from("versions").update({ is_latest: true }).eq("id", nextLatest.id);
      if (updateRes.error) throw updateRes.error;
    }
  }
}

async function recordDownload(input: RecordDownloadInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const payload = {
    app_id: input.appId,
    version_id: input.versionId,
    downloaded_at: new Date().toISOString(),
    user_agent: input.userAgent ?? null,
    user_ip: input.userIp ?? null,
  };

  const { data, error } = await supabase.from("downloads").insert(payload).select("*").single();
  if (error || !data) {
    throw error ?? new Error("Unable to record download");
  }

  return mapDownloadRow(data as DownloadRow);
}

async function getSignedDownloadUrl(apkPath: string) {
  if (isAbsoluteUrl(apkPath)) {
    return apkPath;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { data: userRes, error: userError } = await supabase.auth.getUser();
  if (userError || !userRes.user) {
    throw new Error("Sign in required to download this APK.");
  }

  const { data, error } = await supabase.storage.from(APK_BUCKET).createSignedUrl(apkPath, 60);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Unable to create download link");
  }

  return data.signedUrl;
}

async function getAppBySlug(slug: string, publicView: boolean) {
  const snapshot = await loadCatalogSnapshot();
  const app = snapshot.apps.find((item) => item.slug === slug);
  if (!app) return null;
  if (publicView && !app.isPublished) return null;
  return normalizeAppDetail(app, snapshot.versions, snapshot.screenshots, snapshot.downloads, publicView);
}

async function getAppById(id: string, publicView: boolean) {
  const snapshot = await loadCatalogSnapshot();
  const app = snapshot.apps.find((item) => item.id === id);
  if (!app) return null;
  if (publicView && !app.isPublished) return null;
  return normalizeAppDetail(app, snapshot.versions, snapshot.screenshots, snapshot.downloads, publicView);
}

async function listVersions(appId: string, publicView: boolean) {
  const snapshot = await loadCatalogSnapshot();
  return snapshot.versions
    .filter((version) => version.appId === appId)
    .filter((version) => (publicView ? version.isPublished : true))
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .map((version) => ({
      id: version.id,
      appId: version.appId,
      versionNumber: version.versionNumber,
      apkUrl: version.apkUrl,
      fileSize: version.fileSize ?? null,
      changelog: version.changelog ?? null,
      releaseDate: version.releaseDate,
      isLatest: version.isLatest,
      isPublished: version.isPublished,
      downloadCount: snapshot.downloads.filter((download) => download.versionId === version.id).length,
    }));
}

async function getDashboardStats(): Promise<DashboardStats> {
  const snapshot = await loadCatalogSnapshot();
  return {
    totalApps: snapshot.apps.length,
    totalVersions: snapshot.versions.length,
    totalDownloads: snapshot.downloads.length,
    downloadsToday: summarizeDownloads(snapshot).downloadsToday,
    weeklyDownloads: buildWeeklyDownloads(snapshot),
    recentDownloads: getRecentDownloads(snapshot),
  };
}

async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const snapshot = await loadCatalogSnapshot();
  return summarizeDownloads(snapshot);
}

async function getDownloadsOverTime(period: GetDownloadsOverTimePeriod) {
  const snapshot = await loadCatalogSnapshot();
  const now = new Date();

  if (period === "year") {
    return Array.from({ length: 12 }, (_, index) => {
      const month = startOfMonth(subMonths(now, 11 - index));
      const nextMonth = startOfMonth(subMonths(now, 10 - index));
      return {
        date: month.toISOString(),
        count: snapshot.downloads.filter((download) => {
          const downloadedAt = parseISO(download.downloadedAt);
          return downloadedAt >= month && downloadedAt < nextMonth;
        }).length,
      };
    });
  }

  const days = period === "month" ? 30 : 7;
  return Array.from({ length: days }, (_, index) => {
    const day = subDays(now, days - index - 1);
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return {
      date: dayStart.toISOString(),
      count: snapshot.downloads.filter((download) => {
        const downloadedAt = parseISO(download.downloadedAt);
        return downloadedAt >= dayStart && downloadedAt < dayEnd;
      }).length,
    };
  });
}

async function getTopApps() {
  const snapshot = await loadCatalogSnapshot();
  return aggregateTopApps(snapshot);
}

async function getTopVersions() {
  const snapshot = await loadCatalogSnapshot();
  return aggregateTopVersions(snapshot);
}

async function listPublicApps(search?: string) {
  const snapshot = await loadCatalogSnapshot();
  return filterPublicApps(snapshot, search);
}

async function listFeaturedApps() {
  const snapshot = await loadCatalogSnapshot();
  return filterPublicApps(snapshot).filter((app) => app.featured).slice(0, 4);
}

async function listAdminApps() {
  const snapshot = await loadCatalogSnapshot();
  return filterAdminApps(snapshot);
}

export function getAdminGetAppQueryKey(id?: string) {
  return ["/api/admin/apps", id];
}

export function getAdminListVersionsQueryKey(id?: string) {
  return ["/api/admin/apps", id, "versions"];
}

export function useGetMe(options?: QueryOpts<AuthUser | null>) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? ["/api/me"],
    queryFn: getMe,
    ...options?.query,
  });
}

export function useAdminLogout() {
  return useMutation({
    mutationFn: async () => logout(),
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async ({ data }: { data: LoginInput }) => login(data),
  });
}

export function useListApps(params?: { search?: string }) {
  return useQuery({
    queryKey: ["/api/apps", params?.search ?? ""],
    queryFn: () => listPublicApps(params?.search),
  });
}

export function useListFeaturedApps() {
  return useQuery({
    queryKey: ["/api/apps", "featured"],
    queryFn: listFeaturedApps,
  });
}

export function useGetApp(slug?: string, options?: QueryOpts<AppDetail | null>) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? ["/api/apps", slug],
    queryFn: () => (slug ? getAppBySlug(slug, true) : Promise.resolve(null)),
    enabled: Boolean(slug) && (options?.query?.enabled ?? true),
    ...options?.query,
  });
}

export function useRecordDownload() {
  return useMutation({
    mutationFn: async ({ data }: { data: RecordDownloadInput }) => recordDownload(data),
  });
}

export function useGetSignedDownloadUrl() {
  return useMutation({
    mutationFn: async ({ apkPath }: { apkPath: string }) => getSignedDownloadUrl(apkPath),
  });
}

export function useGetDashboardStats(options?: QueryOpts<DashboardStats>) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? ["/api/admin/dashboard"],
    queryFn: getDashboardStats,
    ...options?.query,
  });
}

export function useAdminListApps(options?: QueryOpts<AppSummary[]>) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? ["/api/admin/apps"],
    queryFn: listAdminApps,
    ...options?.query,
  });
}

export function useAdminGetApp(id?: string, options?: QueryOpts<AppDetail | null>) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getAdminGetAppQueryKey(id),
    queryFn: () => (id ? getAppById(id, false) : Promise.resolve(null)),
    enabled: Boolean(id) && (options?.query?.enabled ?? true),
    ...options?.query,
  });
}

export function useCreateApp() {
  return useMutation({
    mutationFn: async ({ data }: { data: AppInput }) => createApp(data),
  });
}

export function useUpdateApp() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppInput }) => updateApp(id, data),
  });
}

export function useDeleteApp() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => deleteApp(id),
  });
}

export function useAdminListVersions(appId?: string, options?: QueryOpts<AppVersion[]>) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getAdminListVersionsQueryKey(appId),
    queryFn: () => (appId ? listVersions(appId, false) : Promise.resolve([])),
    enabled: Boolean(appId) && (options?.query?.enabled ?? true),
    ...options?.query,
  });
}

export function useCreateVersion() {
  return useMutation({
    mutationFn: async ({ appId, data }: { appId: string; data: VersionInput }) => createVersion(appId, data),
  });
}

export function useDeleteVersion() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => deleteVersion(id),
  });
}

export function useGetAnalyticsSummary() {
  return useQuery({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: getAnalyticsSummary,
  });
}

export function useGetDownloadsOverTime(params: { period: GetDownloadsOverTimePeriod }) {
  return useQuery({
    queryKey: ["/api/admin/analytics/downloads", params.period],
    queryFn: () => getDownloadsOverTime(params.period),
  });
}

export function useGetTopApps() {
  return useQuery({
    queryKey: ["/api/admin/analytics/top-apps"],
    queryFn: getTopApps,
  });
}

export function useGetTopVersions() {
  return useQuery({
    queryKey: ["/api/admin/analytics/top-versions"],
    queryFn: getTopVersions,
  });
}

export type {
  AnalyticsSummary,
  AppDetail,
  AppSummary,
  AppVersion,
  AuthUser,
  DashboardStats,
  GetDownloadsOverTimePeriod,
  RecentDownload,
  TopApp,
  TopVersion,
};
