// firebase-admin.ts
// Uses dynamic import() to lazily load firebase-admin at RUNTIME.
// This prevents the "Cannot read properties of undefined (reading 'SDK_VERSION')"
// crash that occurs when Vite/Nitro bundles firebase-admin into an ESM chunk
// and Node.js tries to evaluate it at module-parse time.

let _admin: any = null;
let _initPromise: Promise<any> | null = null;

async function getAdmin() {
  if (_admin) return _admin;

  if (!_initPromise) {
    _initPromise = (async () => {
      const mod = await import("firebase-admin");
      const admin = mod.default ?? mod;

      if (admin.apps.length === 0) {
        try {
          if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            let cleaned = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
            // Unwrap outer quotes that Vercel config sometimes adds
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              try {
                cleaned = JSON.parse(cleaned);
              } catch {
                // keep original
              }
            }

            const serviceAccount = JSON.parse(cleaned);

            // Replace literal '\n' with actual newlines in private key
            if (serviceAccount.private_key) {
              serviceAccount.private_key = serviceAccount.private_key.replace(
                /\\n/g,
                "\n",
              );
            }

            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
          } else {
            admin.initializeApp();
          }
        } catch (error) {
          console.error(
            "FATAL: Firebase Admin SDK Initialization Error. Check your FIREBASE_SERVICE_ACCOUNT env var on Vercel:",
            error,
          );
        }
      }

      _admin = admin;
      return admin;
    })();
  }

  return _initPromise;
}

/** Returns an initialised Firestore instance. */
export async function getDb(): Promise<FirebaseFirestore.Firestore> {
  const admin = await getAdmin();
  if (admin.apps.length === 0) {
    throw new Error(
      "Firebase Admin is not initialized. Check FIREBASE_SERVICE_ACCOUNT in Vercel.",
    );
  }
  return admin.firestore();
}

/** Returns an initialised Auth instance. */
export async function getAdminAuth() {
  const admin = await getAdmin();
  if (admin.apps.length === 0) {
    throw new Error(
      "Firebase Admin is not initialized. Check FIREBASE_SERVICE_ACCOUNT in Vercel.",
    );
  }
  return admin.auth();
}
