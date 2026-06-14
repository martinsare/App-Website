import { useMutation, useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import { format, isWithinInterval, parseISO, startOfDay, subDays, subMonths, subYears } from "date-fns";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import { demoCredentials, seedSnapshot } from "./catalog-seed";
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

const STORAGE_KEY = "amk-catalog-state";
const SESSION_KEY = "amk-admin-session";

let localCache: CatalogSnapshot | null = null;
let loadingPromise: Promise<CatalogSnapshot> | null = null;
let warnedFallback = false;

function cloneSnapshot(snapshot: CatalogSnapshot): CatalogSnapshot {
  return structuredClone(snapshot);
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getLocalSnapshot(): CatalogSnapshot {
  if (localCache) return cloneSnapshot(localCache);

  const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (!raw) {
    localCache = cloneSnapshot(seedSnapshot);
    return cloneSnapshot(localCache);
  }

  try {
    localCache = JSON.parse(raw) as CatalogSnapshot;
    return cloneSnapshot(localCache);
  } catch {
    localCache = cloneSnapshot(seedSnapshot);
    return cloneSnapshot(localCache);
  }
}

function setLocalSnapshot(next: CatalogSnapshot) {
  localCache = cloneSnapshot(next);
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
}

function getLocalSessionUser(): AuthUser | null {
  const raw = globalThis.localStorage?.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setLocalSessionUser(user: AuthUser | null) {
  if (!user) {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(user));
}

function withSession(snapshot: CatalogSnapshot): CatalogSnapshot {
  return {
    ...snapshot,
    sessionUser: snapshot.sessionUser ?? getLocalSessionUser(),
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

function aggregateTopApps(snapshot: CatalogSnapshot, publicView: boolean): TopApp[] {
  return snapshot.apps
    .filter((app) => (publicView ? app.isPublished : true))
    .map((app) => {
      const versions = snapshot.versions.filter((version) => version.appId === app.id);
      const latest = versions
        .filter((version) => (publicView ? version.isPublished : true))
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

function buildWeeklyDownloads(snapshot: CatalogSnapshot, days: number) {
  const end = new Date();
  const points = Array.from({ length: days }, (_, index) => {
    const day = subDays(end, days - index - 1);
    const start = startOfDay(day);
    return {
      date: start.toISOString(),
      count: snapshot.downloads.filter((download) => {
        const downloadedAt = parseISO(download.downloadedAt);
        return downloadedAt >= start && downloadedAt < new Date(start.getTime() + 24 * 60 * 60 * 1000);
      }).length,
    };
  });
  return points;
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

async function loadSnapshot(): Promise<CatalogSnapshot> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    if (!hasSupabaseConfig()) {
      return withSession(getLocalSnapshot());
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return withSession(getLocalSnapshot());
    }

    try {
      const [appsRes, versionsRes, screenshotsRes, downloadsRes, userRes] = await Promise.all([
        supabase.from("apps").select("*").order("name", { ascending: true }),
        supabase.from("versions").select("*").order("release_date", { ascending: false }),
        supabase.from("screenshots").select("*").order("sort_order", { ascending: true }),
        supabase.from("downloads").select("*").order("downloaded_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);

      if (appsRes.error || versionsRes.error || screenshotsRes.error || downloadsRes.error) {
        throw appsRes.error ?? versionsRes.error ?? screenshotsRes.error ?? downloadsRes.error;
      }

      return {
        apps: (appsRes.data ?? []).map((row: any) => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          shortDescription: row.short_description,
          fullDescription: row.full_description,
          iconUrl: row.icon_url ?? null,
          featured: Boolean(row.featured),
          isPublished: Boolean(row.is_published),
        })),
        versions: (versionsRes.data ?? []).map((row: any) => ({
          id: row.id,
          appId: row.app_id,
          versionNumber: row.version_number,
          apkUrl: row.apk_url,
          fileSize: row.file_size ?? null,
          changelog: row.changelog ?? null,
          releaseDate: row.release_date,
          isLatest: Boolean(row.is_latest),
          isPublished: Boolean(row.is_published),
        })),
        screenshots: (screenshotsRes.data ?? []).map((row: any) => ({
          id: row.id,
          appId: row.app_id,
          imageUrl: row.image_url,
          sortOrder: Number(row.sort_order ?? 0),
        })),
        downloads: (downloadsRes.data ?? []).map((row: any) => ({
          id: row.id,
          appId: row.app_id,
          versionId: row.version_id,
          downloadedAt: row.downloaded_at,
          userAgent: row.user_agent ?? null,
          userIp: row.user_ip ?? null,
        })),
        sessionUser: userRes.data.user
          ? { id: userRes.data.user.id, email: userRes.data.user.email ?? "" }
          : null,
      };
    } catch (error) {
      if (!warnedFallback) {
        console.warn("Supabase unavailable; using local catalog data.", error);
        warnedFallback = true;
      }
      return withSession(getLocalSnapshot());
    }
  })();

  try {
    const snapshot = await loadingPromise;
    return snapshot;
  } finally {
    loadingPromise = null;
  }
}

async function persistSnapshot(next: CatalogSnapshot) {
  if (!hasSupabaseConfig()) {
    setLocalSnapshot(next);
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    setLocalSnapshot(next);
    return;
  }

  await Promise.all([
    supabase.from("apps").upsert(
      next.apps.map((app) => ({
        id: app.id,
        slug: app.slug,
        name: app.name,
        short_description: app.shortDescription,
        full_description: app.fullDescription,
        icon_url: app.iconUrl ?? null,
        featured: app.featured,
        is_published: app.isPublished,
      })),
      { onConflict: "id" },
    ),
    supabase.from("versions").upsert(
      next.versions.map((version) => ({
        id: version.id,
        app_id: version.appId,
        version_number: version.versionNumber,
        apk_url: version.apkUrl,
        file_size: version.fileSize ?? null,
        changelog: version.changelog ?? null,
        release_date: version.releaseDate,
        is_latest: version.isLatest,
        is_published: version.isPublished,
      })),
      { onConflict: "id" },
    ),
    supabase.from("screenshots").upsert(
      next.screenshots.map((shot) => ({
        id: shot.id,
        app_id: shot.appId,
        image_url: shot.imageUrl,
        sort_order: shot.sortOrder,
      })),
      { onConflict: "id" },
    ),
    supabase.from("downloads").upsert(
      next.downloads.map((download) => ({
        id: download.id,
        app_id: download.appId,
        version_id: download.versionId,
        downloaded_at: download.downloadedAt,
        user_agent: download.userAgent ?? null,
        user_ip: download.userIp ?? null,
      })),
      { onConflict: "id" },
    ),
  ]);
}

async function mutateSnapshot(mutator: (snapshot: CatalogSnapshot) => CatalogSnapshot) {
  const snapshot = await loadSnapshot();
  const next = mutator(cloneSnapshot(snapshot));
  await persistSnapshot(next);
  return next;
}

function toPublicApps(snapshot: CatalogSnapshot, search?: string) {
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

function toAdminApps(snapshot: CatalogSnapshot) {
  return snapshot.apps
    .map((app) => normalizeAppSummary(app, snapshot.versions, snapshot.downloads, false))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getMe(): Promise<AuthUser | null> {
  if (!hasSupabaseConfig()) {
    return getLocalSessionUser();
  }
  const supabase = getSupabaseClient();
  if (!supabase) return getLocalSessionUser();
  const { data } = await supabase.auth.getUser();
  return data.user
    ? { id: data.user.id, email: data.user.email ?? "" }
    : getLocalSessionUser();
}

async function login(input: LoginInput) {
  if (!hasSupabaseConfig()) {
    if (input.email.toLowerCase() !== demoCredentials.email || input.password !== demoCredentials.password) {
      throw new Error("Invalid credentials");
    }
    const user = { id: "local-admin", email: input.email };
    setLocalSessionUser(user);
    return user;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client unavailable");
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
  if (!hasSupabaseConfig()) {
    setLocalSessionUser(null);
    return;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    setLocalSessionUser(null);
    return;
  }
  await supabase.auth.signOut();
}

async function createApp(input: AppInput) {
  const slug = createSlug(input.name);
  const app: AppRecord = {
    id: crypto.randomUUID(),
    slug,
    name: input.name,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    iconUrl: input.iconUrl || null,
    featured: false,
    isPublished: input.isPublished,
  };

  const next = await mutateSnapshot((snapshot) => {
    snapshot.apps.push(app);
    return snapshot;
  });

  return normalizeAppSummary(app, next.versions, next.downloads, false);
}

async function updateApp(id: string, input: AppInput) {
  let updated: AppRecord | null = null;
  const next = await mutateSnapshot((snapshot) => {
    const app = snapshot.apps.find((item) => item.id === id);
    if (!app) throw new Error("App not found");
    app.name = input.name;
    app.slug = createSlug(input.name);
    app.shortDescription = input.shortDescription;
    app.fullDescription = input.fullDescription;
    app.iconUrl = input.iconUrl || null;
    app.isPublished = input.isPublished;
    updated = app;
    return snapshot;
  });

  if (!updated) throw new Error("App not found");
  return normalizeAppSummary(updated, next.versions, next.downloads, false);
}

async function deleteApp(id: string) {
  await mutateSnapshot((snapshot) => {
    snapshot.apps = snapshot.apps.filter((app) => app.id !== id);
    snapshot.versions = snapshot.versions.filter((version) => version.appId !== id);
    snapshot.screenshots = snapshot.screenshots.filter((shot) => shot.appId !== id);
    snapshot.downloads = snapshot.downloads.filter((download) => download.appId !== id);
    return snapshot;
  });
}

async function createVersion(appId: string, input: VersionInput) {
  let nextVersion: VersionRecord | null = null;
  const next = await mutateSnapshot((snapshot) => {
    const exists = snapshot.apps.some((app) => app.id === appId);
    if (!exists) throw new Error("App not found");

    if (input.isLatest) {
      snapshot.versions
        .filter((version) => version.appId === appId)
        .forEach((version) => {
          version.isLatest = false;
        });
    }

    nextVersion = {
      id: crypto.randomUUID(),
      appId,
      versionNumber: input.versionNumber,
      apkUrl: input.apkUrl,
      fileSize: input.fileSize || null,
      changelog: input.changelog || null,
      releaseDate: new Date().toISOString(),
      isLatest: input.isLatest,
      isPublished: input.isPublished,
    };

    snapshot.versions.push(nextVersion);
    return snapshot;
  });

  const version = nextVersion as unknown as VersionRecord;
  if (!version) throw new Error("Unable to create version");
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
  await mutateSnapshot((snapshot) => {
    const version = snapshot.versions.find((item) => item.id === id);
    if (!version) throw new Error("Version not found");
    snapshot.downloads = snapshot.downloads.filter((download) => download.versionId !== id);
    snapshot.versions = snapshot.versions.filter((item) => item.id !== id);

    if (version.isLatest) {
      const remaining = snapshot.versions
        .filter((item) => item.appId === version.appId)
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      if (remaining[0]) {
        remaining[0].isLatest = true;
      }
    }
    return snapshot;
  });
}

async function recordDownload(input: RecordDownloadInput) {
  const next = await mutateSnapshot((snapshot) => {
    snapshot.downloads.push({
      id: crypto.randomUUID(),
      appId: input.appId,
      versionId: input.versionId,
      downloadedAt: new Date().toISOString(),
      userAgent: input.userAgent ?? null,
      userIp: input.userIp ?? null,
    });
    return snapshot;
  });

  return next.downloads[next.downloads.length - 1];
}

async function getAppBySlug(slug: string, publicView: boolean) {
  const snapshot = await loadSnapshot();
  const app = snapshot.apps.find((item) => item.slug === slug);
  if (!app) return null;
  if (publicView && !app.isPublished) return null;
  return normalizeAppDetail(app, snapshot.versions, snapshot.screenshots, snapshot.downloads, publicView);
}

async function getAppById(id: string, publicView: boolean) {
  const snapshot = await loadSnapshot();
  const app = snapshot.apps.find((item) => item.id === id);
  if (!app) return null;
  if (publicView && !app.isPublished) return null;
  return normalizeAppDetail(app, snapshot.versions, snapshot.screenshots, snapshot.downloads, publicView);
}

async function listVersions(appId: string, publicView: boolean) {
  const snapshot = await loadSnapshot();
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
  const snapshot = await loadSnapshot();
  return {
    totalApps: snapshot.apps.filter((app) => app.isPublished).length,
    totalDownloads: snapshot.downloads.length,
    downloadsToday: summarizeDownloads(snapshot).downloadsToday,
    weeklyDownloads: buildWeeklyDownloads(snapshot, 7),
    recentDownloads: getRecentDownloads(snapshot),
  };
}

async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const snapshot = await loadSnapshot();
  return summarizeDownloads(snapshot);
}

async function getDownloadsOverTime(period: GetDownloadsOverTimePeriod) {
  const snapshot = await loadSnapshot();
  const now = new Date();
  const start =
    period === "year"
      ? subYears(now, 1)
      : period === "month"
        ? subMonths(now, 1)
        : subDays(now, 7);

  const days = period === "year" ? 12 : period === "month" ? 30 : 7;
  const points = Array.from({ length: days }, (_, index) => {
    const day = subDays(now, days - index - 1);
    const dayStart = startOfDay(day);
    const dayEnd = startOfDay(new Date(day.getTime() + 24 * 60 * 60 * 1000));
    return {
      date: dayStart.toISOString(),
      count: snapshot.downloads.filter((download) => {
        const downloadedAt = parseISO(download.downloadedAt);
        return downloadedAt >= start && downloadedAt >= dayStart && downloadedAt < dayEnd;
      }).length,
    };
  });

  return points;
}

async function getTopApps() {
  const snapshot = await loadSnapshot();
  return aggregateTopApps(snapshot, false);
}

async function listPublicApps(search?: string) {
  const snapshot = await loadSnapshot();
  return toPublicApps(snapshot, search);
}

async function listFeaturedApps() {
  const snapshot = await loadSnapshot();
  return toPublicApps(snapshot)
    .filter((app) => app.featured)
    .slice(0, 4);
}

async function listAdminApps() {
  const snapshot = await loadSnapshot();
  return toAdminApps(snapshot);
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

export type { AnalyticsSummary, AppDetail, AppSummary, AppVersion, AuthUser, DashboardStats, GetDownloadsOverTimePeriod, RecentDownload, TopApp };
