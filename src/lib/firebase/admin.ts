// Lazy-loaded Firebase Admin SDK helper
// Ensures serverless environments (Netlify, Vercel, AWS Lambda) don't crash on startup if firebase-admin is unconfigured

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (privateKey) {
  // Convert literal \n in string if present
  privateKey = privateKey.replace(/\\n/g, "\n");
  // Remove wrapping quotes if entered by user
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
}

export const isAdminConfigured: boolean = Boolean(
  (projectId && clientEmail && privateKey) || serviceAccountJson
);

export function getFirebaseAdminApp(): any {
  if (!isAdminConfigured) {
    return null;
  }

  try {
    // Dynamic import to prevent bundler crashes on serverless when Admin SDK credentials are not present
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const adminApp = require("firebase-admin/app");
    const existingApps = adminApp.getApps();
    if (existingApps.length > 0) {
      return existingApps[0];
    }

    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      return adminApp.initializeApp({
        credential: adminApp.cert(parsed),
      });
    }

    if (projectId && clientEmail && privateKey) {
      return adminApp.initializeApp({
        credential: adminApp.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  } catch (error) {
    console.warn("Firebase Admin initialization error:", error);
  }

  return null;
}

export function getAdminAuth(): any {
  if (!isAdminConfigured) return null;
  try {
    const adminApp = getFirebaseAdminApp();
    if (!adminApp) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    return getAuth(adminApp);
  } catch (err) {
    console.warn("Firebase Admin Auth error:", err);
    return null;
  }
}
