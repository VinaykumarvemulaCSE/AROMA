import { getAdminAuth } from "../firebase-admin.server";

export async function verifyIdToken(idToken: string) {
  const auth = await getAdminAuth();
  return auth.verifyIdToken(idToken);
}

export async function verifyAdmin(idToken: string) {
  const decoded = await verifyIdToken(idToken);
  if (decoded.admin !== true) {
    throw new Error("Admin access required.");
  }
  return decoded;
}

export async function resolveUserIdFromToken(idToken?: string) {
  if (!idToken) {
    console.log("resolveUserIdFromToken: No idToken provided");
    return null;
  }
  try {
    const decoded = await verifyIdToken(idToken);
    return decoded.uid;
  } catch (err) {
    console.error(
      "resolveUserIdFromToken: ID Token verification failed. " +
        `Client Project ID is: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}. ` +
        "Error:",
      err,
    );
    return null;
  }
}
