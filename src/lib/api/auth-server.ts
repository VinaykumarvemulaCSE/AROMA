import { getAuth } from "firebase-admin/auth";

export async function verifyIdToken(idToken: string) {
  return getAuth().verifyIdToken(idToken);
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
