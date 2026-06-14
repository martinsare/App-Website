export const mockApps = [
  {
    id: "1",
    name: "Department Connect",
    slug: "department-connect",
    shortDescription: "Connect and communicate easily within your department.",
    fullDescription:
      "Department Connect is a powerful communication tool designed for teams and organizations. It provides real-time messaging, file sharing, and task management to streamline your department workflows. Built with security in mind, it keeps all your organizational data safe and accessible.",
    iconUrl: "/icons/department-connect.png",
    isPublished: true,
    latestVersion: "v1.0.2",
    releaseDate: "2024-05-20",
    totalDownloads: 1892,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-05-20T08:00:00Z",
  },
  {
    id: "2",
    name: "AMK Notes",
    slug: "amk-notes",
    shortDescription: "A simple and secure notes app.",
    fullDescription:
      "AMK Notes is a lightweight, fast, and secure note-taking application. Write, organize, and search your notes with ease. Supports markdown formatting, tags, and cloud backup for seamless access across all your devices.",
    iconUrl: "/icons/amk-notes.png",
    isPublished: true,
    latestVersion: "v2.1.0",
    releaseDate: "2024-05-18",
    totalDownloads: 1103,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-05-18T08:00:00Z",
  },
  {
    id: "3",
    name: "AMK Cleaner",
    slug: "amk-cleaner",
    shortDescription: "Clear junk files and speed up your device.",
    fullDescription:
      "AMK Cleaner is an advanced optimization tool for Android devices. It removes junk files, clears cache, and boosts your device performance. With one tap cleaning and real-time monitoring, keep your phone running at its best.",
    iconUrl: "/icons/amk-cleaner.png",
    isPublished: true,
    latestVersion: "v3.5.0",
    releaseDate: "2024-05-15",
    totalDownloads: 768,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-05-15T08:00:00Z",
  },
  {
    id: "4",
    name: "AMK Weather",
    slug: "amk-weather",
    shortDescription: "Get real-time weather updates.",
    fullDescription:
      "AMK Weather delivers accurate, real-time weather forecasts right to your device. View hourly and 7-day forecasts, weather alerts, and radar maps. Supports multiple locations and beautiful animated weather icons.",
    iconUrl: "/icons/amk-weather.png",
    isPublished: true,
    latestVersion: "v1.8.0",
    releaseDate: "2024-05-16",
    totalDownloads: 481,
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-05-16T08:00:00Z",
  },
  {
    id: "5",
    name: "AMK Calculator",
    slug: "amk-calculator",
    shortDescription: "A powerful scientific calculator.",
    fullDescription:
      "AMK Calculator combines a simple everyday calculator with advanced scientific functions. Supports history, unit conversion, and expression editing. Perfect for students and professionals alike.",
    iconUrl: "/icons/amk-calculator.png",
    isPublished: false,
    latestVersion: "v2.0.6",
    releaseDate: "2024-04-10",
    totalDownloads: 0,
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-10T08:00:00Z",
  },
  {
    id: "6",
    name: "AMK Dictionary",
    slug: "amk-dictionary",
    shortDescription: "Offline English dictionary and thesaurus.",
    fullDescription:
      "AMK Dictionary is a comprehensive offline English dictionary and thesaurus. Over 200,000 definitions, synonyms, antonyms, and example sentences. No internet required — works completely offline.",
    iconUrl: "/icons/amk-dictionary.png",
    isPublished: false,
    latestVersion: "v1.0.0",
    releaseDate: "2024-04-20",
    totalDownloads: 0,
    createdAt: "2024-04-15T10:00:00Z",
    updatedAt: "2024-04-20T08:00:00Z",
  },
];

export const mockVersions: Record<
  string,
  Array<{
    id: string;
    appId: string;
    versionNumber: string;
    apkUrl: string;
    fileSize: string | null;
    changelog: string | null;
    isLatest: boolean;
    isPublished: boolean;
    releaseDate: string;
    createdAt: string;
  }>
> = {
  "1": [
    {
      id: "v1-3",
      appId: "1",
      versionNumber: "v1.0.2",
      apkUrl: "/api/mock-apk/department-connect-1.0.2.apk",
      fileSize: "15.6 MB",
      changelog:
        "Fixed login issue and improved dashboard speed.\nMinor bug fixes and performance improvements.",
      isLatest: true,
      isPublished: true,
      releaseDate: "2024-05-20",
      createdAt: "2024-05-20T08:00:00Z",
    },
    {
      id: "v1-2",
      appId: "1",
      versionNumber: "v1.0.1",
      apkUrl: "/api/mock-apk/department-connect-1.0.1.apk",
      fileSize: "15.2 MB",
      changelog: "Minor bug fixes.",
      isLatest: false,
      isPublished: true,
      releaseDate: "2024-05-12",
      createdAt: "2024-05-12T08:00:00Z",
    },
    {
      id: "v1-1",
      appId: "1",
      versionNumber: "v1.0.0",
      apkUrl: "/api/mock-apk/department-connect-1.0.0.apk",
      fileSize: "14.8 MB",
      changelog: "Initial release.",
      isLatest: false,
      isPublished: true,
      releaseDate: "2024-05-01",
      createdAt: "2024-05-01T08:00:00Z",
    },
  ],
  "2": [
    {
      id: "v2-3",
      appId: "2",
      versionNumber: "v2.1.0",
      apkUrl: "/api/mock-apk/amk-notes-2.1.0.apk",
      fileSize: "8.3 MB",
      changelog: "Added dark mode and markdown preview.",
      isLatest: true,
      isPublished: true,
      releaseDate: "2024-05-18",
      createdAt: "2024-05-18T08:00:00Z",
    },
    {
      id: "v2-2",
      appId: "2",
      versionNumber: "v2.0.0",
      apkUrl: "/api/mock-apk/amk-notes-2.0.0.apk",
      fileSize: "7.9 MB",
      changelog: "Major UI overhaul and new sync feature.",
      isLatest: false,
      isPublished: true,
      releaseDate: "2024-04-10",
      createdAt: "2024-04-10T08:00:00Z",
    },
  ],
  "3": [
    {
      id: "v3-1",
      appId: "3",
      versionNumber: "v3.5.0",
      apkUrl: "/api/mock-apk/amk-cleaner-3.5.0.apk",
      fileSize: "6.1 MB",
      changelog: "Improved junk detection algorithm.",
      isLatest: true,
      isPublished: true,
      releaseDate: "2024-05-15",
      createdAt: "2024-05-15T08:00:00Z",
    },
  ],
  "4": [
    {
      id: "v4-1",
      appId: "4",
      versionNumber: "v1.8.0",
      apkUrl: "/api/mock-apk/amk-weather-1.8.0.apk",
      fileSize: "9.4 MB",
      changelog: "Added radar map and hourly forecast.",
      isLatest: true,
      isPublished: true,
      releaseDate: "2024-05-16",
      createdAt: "2024-05-16T08:00:00Z",
    },
  ],
  "5": [
    {
      id: "v5-1",
      appId: "5",
      versionNumber: "v2.0.6",
      apkUrl: "/api/mock-apk/amk-calculator-2.0.6.apk",
      fileSize: "3.2 MB",
      changelog: "Scientific mode improvements.",
      isLatest: true,
      isPublished: false,
      releaseDate: "2024-04-10",
      createdAt: "2024-04-10T08:00:00Z",
    },
  ],
  "6": [
    {
      id: "v6-1",
      appId: "6",
      versionNumber: "v1.0.0",
      apkUrl: "/api/mock-apk/amk-dictionary-1.0.0.apk",
      fileSize: "42.7 MB",
      changelog: "Initial release with full offline dictionary.",
      isLatest: true,
      isPublished: false,
      releaseDate: "2024-04-20",
      createdAt: "2024-04-20T08:00:00Z",
    },
  ],
};

export const mockScreenshots: Record<
  string,
  Array<{
    id: string;
    appId: string;
    imageUrl: string;
    sortOrder: number;
    createdAt: string;
  }>
> = {
  "1": [
    {
      id: "s1-1",
      appId: "1",
      imageUrl:
        "https://via.placeholder.com/390x844/4CAF50/ffffff?text=Dashboard",
      sortOrder: 1,
      createdAt: "2024-05-01T08:00:00Z",
    },
    {
      id: "s1-2",
      appId: "1",
      imageUrl:
        "https://via.placeholder.com/390x844/388E3C/ffffff?text=Messages",
      sortOrder: 2,
      createdAt: "2024-05-01T08:00:00Z",
    },
    {
      id: "s1-3",
      appId: "1",
      imageUrl:
        "https://via.placeholder.com/390x844/2E7D32/ffffff?text=Profile",
      sortOrder: 3,
      createdAt: "2024-05-01T08:00:00Z",
    },
  ],
  "2": [
    {
      id: "s2-1",
      appId: "2",
      imageUrl:
        "https://via.placeholder.com/390x844/2196F3/ffffff?text=Notes+List",
      sortOrder: 1,
      createdAt: "2024-04-01T08:00:00Z",
    },
    {
      id: "s2-2",
      appId: "2",
      imageUrl:
        "https://via.placeholder.com/390x844/1565C0/ffffff?text=Note+Editor",
      sortOrder: 2,
      createdAt: "2024-04-01T08:00:00Z",
    },
  ],
};

export const mockDownloads = [
  {
    id: "d1",
    appId: "1",
    appName: "Department Connect",
    versionNumber: "v1.0.2",
    downloadedAt: "2024-05-28T14:32:00Z",
    userAgent: "Mozilla/5.0 (Android 13)",
    ipAddress: "192.168.1.1",
    referrer: null,
  },
  {
    id: "d2",
    appId: "1",
    appName: "Department Connect",
    versionNumber: "v1.0.2",
    downloadedAt: "2024-05-28T13:15:00Z",
    userAgent: "Mozilla/5.0 (Android 12)",
    ipAddress: "10.0.0.5",
    referrer: "https://google.com",
  },
  {
    id: "d3",
    appId: "2",
    appName: "AMK Notes",
    versionNumber: "v2.1.0",
    downloadedAt: "2024-05-28T12:00:00Z",
    userAgent: "Mozilla/5.0 (Android 13)",
    ipAddress: "172.16.0.2",
    referrer: null,
  },
  {
    id: "d4",
    appId: "3",
    appName: "AMK Cleaner",
    versionNumber: "v3.5.0",
    downloadedAt: "2024-05-28T11:45:00Z",
    userAgent: "Mozilla/5.0 (Android 11)",
    ipAddress: "192.168.2.10",
    referrer: null,
  },
  {
    id: "d5",
    appId: "1",
    appName: "Department Connect",
    versionNumber: "v1.0.2",
    downloadedAt: "2024-05-28T10:30:00Z",
    userAgent: "Mozilla/5.0 (Android 14)",
    ipAddress: "10.10.10.1",
    referrer: null,
  },
];

export const mockWeeklyDownloads = [
  { date: "May 22", count: 180 },
  { date: "May 23", count: 240 },
  { date: "May 24", count: 195 },
  { date: "May 25", count: 320 },
  { date: "May 26", count: 280 },
  { date: "May 27", count: 350 },
  { date: "May 28", count: 342 },
];

export const mockMonthlyDownloads = Array.from({ length: 28 }, (_, i) => ({
  date: `May ${i + 1}`,
  count: Math.floor(Math.random() * 400 + 100),
}));
