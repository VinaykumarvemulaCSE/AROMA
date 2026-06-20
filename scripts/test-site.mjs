/**
 * Smoke + auth integration test for Aroma Cafe.
 * Usage: node scripts/test-site.mjs [baseUrl]
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = process.argv[2] ?? "http://localhost:5174";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

const env = loadEnv();
const API_KEY = env.VITE_FIREBASE_API_KEY;
const ADMIN_EMAIL = env.VITE_ADMIN_EMAIL ?? "kumarvinay072007@gmail.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "Vinay@123";

const routes = [
  "/",
  "/menu",
  "/cart",
  "/checkout",
  "/reservations",
  "/reviews",
  "/about",
  "/contact",
  "/faq",
  "/gallery",
  "/auth/login",
  "/auth/signup",
  "/profile",
  "/orders",
  "/admin/login",
  "/admin",
];

function decodeJwt(token) {
  const payload = token.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

async function testPages() {
  const results = [];
  for (const route of routes) {
    try {
      const res = await fetch(`${BASE}${route}`, { redirect: "follow" });
      results.push({ route, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({ route, ok: false, status: 0, error: String(err) });
    }
  }
  return results;
}

async function testAdminAuth() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        returnSecureToken: true,
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.error?.message ?? JSON.stringify(data) };
  }
  const claims = decodeJwt(data.idToken);
  return {
    ok: true,
    email: claims.email,
    adminClaim: claims.admin === true,
    uid: claims.user_id ?? claims.sub,
    hasRefreshToken: Boolean(data.refreshToken),
  };
}

async function testFirestorePublicRead(idToken) {
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/menu_items?pageSize=1`;
  const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};
  const res = await fetch(url, { headers });
  return { ok: res.ok, status: res.status };
}

async function testFirestoreAdminOrdersList(idToken) {
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "orders" }],
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 1,
      },
    }),
  });
  return { ok: res.ok, status: res.status };
}

async function main() {
  console.log(`\n🧪 Aroma Cafe test suite — ${BASE}\n`);

  console.log("── Page loads ──");
  const pages = await testPages();
  let pageFails = 0;
  for (const p of pages) {
    const mark = p.ok ? "✅" : "❌";
    console.log(`${mark} ${p.route} → ${p.status}${p.error ? ` (${p.error})` : ""}`);
    if (!p.ok) pageFails++;
  }

  console.log("\n── Admin Firebase Auth ──");
  const auth = await testAdminAuth();
  if (!auth.ok) {
    console.log(`❌ Sign-in failed: ${auth.error}`);
  } else {
    console.log(`✅ Signed in as ${auth.email} (${auth.uid})`);
    console.log(`${auth.adminClaim ? "✅" : "❌"} admin custom claim on token`);
    console.log(`${auth.hasRefreshToken ? "✅" : "❌"} refresh token returned`);
  }

  let token = null;
  if (auth.ok) {
    const signIn = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          returnSecureToken: true,
        }),
      },
    );
    const signInData = await signIn.json();
    token = signInData.idToken;
  }

  console.log("\n── Firestore rules ──");
  const publicRead = await testFirestorePublicRead(null);
  console.log(`${publicRead.ok ? "✅" : "❌"} Public menu_items read (no auth) → ${publicRead.status}`);

  if (token) {
    const adminOrders = await testFirestoreAdminOrdersList(token);
    console.log(
      `${adminOrders.ok ? "✅" : "❌"} Admin orders list query → ${adminOrders.status}`,
    );
  }

  console.log("\n── Config ──");
  console.log(`✅ VITE_ADMIN_EMAIL=${ADMIN_EMAIL}`);

  const totalFails =
    pageFails + (auth.ok ? 0 : 1) + (auth.adminClaim ? 0 : auth.ok ? 1 : 0) + (publicRead.ok ? 0 : 1);

  console.log(`\n${totalFails === 0 ? "✅ All checks passed" : `❌ ${totalFails} check(s) failed`}\n`);
  process.exit(totalFails === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
