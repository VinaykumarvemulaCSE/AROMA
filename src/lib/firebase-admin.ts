import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let cleaned = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // If the env var is wrapped in outer quotes (often happens in Vercel config), unwrap it first
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        try {
          cleaned = JSON.parse(cleaned);
        } catch {
          // Fallback to original if parsing fails
        }
      }
      
      const serviceAccount = JSON.parse(cleaned);
      
      // Replace literal '\\n' with actual newlines in the private key if present
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({ credential: cert(serviceAccount) });
    } else {
      initializeApp();
    }
  } catch (error) {
    console.error("FATAL: Firebase Admin SDK Initialization Error. Check your FIREBASE_SERVICE_ACCOUNT env var on Vercel:", error);
    // Don't throw here, let getAuth() or getFirestore() throw when accessed
  }
}

// Export a proxy so getFirestore() isn't called at module load time.
// This prevents a 500 error during module loading and instead throws when the db is actually used.
export const adminDb = new Proxy({} as FirebaseFirestore.Firestore, {
  get(target, prop) {
    if (getApps().length === 0) {
      throw new Error("Firebase Admin is not initialized. Check FIREBASE_SERVICE_ACCOUNT in Vercel.");
    }
    const db = getFirestore();
    return (db as any)[prop];
  }
});
