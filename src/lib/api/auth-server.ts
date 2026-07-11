import "../firebase-admin"; // Initialize app first
import admin from "firebase-admin";

export async function verifyIdToken(idToken: string) {
  return admin.auth().verifyIdToken(idToken);
}

export async function verifyAdmin(idToken: string) {
  const decoded = await verifyIdToken(idToken);
  if (decoded.admin !== true) {
    throw new Error("Admin access required.");
  }
  return decoded;
}

export async function resolveUserIdFromToken(idToken?: string) {
  if (!idToken) return null;
  try {
    const decoded = await verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

