import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Fallback to Application Default Credentials (e.g. standard environment authentication)
      initializeApp();
    }
  } catch (error) {
    console.error("Firebase Admin SDK Initialization Error:", error);
  }
}

export const adminDb = getFirestore();
