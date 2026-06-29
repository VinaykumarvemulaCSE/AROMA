import { o as __toESM } from "../_runtime.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as contactMessageSchema } from "./schemas-B_Z4Eu_V.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
import { n as rateLimit } from "./rate-limit-zhwmVyqd.mjs";
import { t as sanitizeInput } from "./sanitize-CaeEIUq3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/email-BbtqddJu.js
function escapeHtml(unsafe) {
	return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
async function getTransporter() {
	const host = process.env.SMTP_HOST;
	const port = parseInt(process.env.SMTP_PORT || "587");
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	if (!host || !user || !pass) {
		console.warn("SMTP credentials missing in .env. Email sending will be logged to console instead.");
		return { sendMail: async (options) => {
			console.log("--- MOCK EMAIL SENT ---");
			console.log(`To: ${options.to}`);
			console.log(`Subject: ${options.subject}`);
			console.log(`HTML: ${options.html.substring(0, 300)}...`);
			return { messageId: "mock-id-" + Date.now() };
		} };
	}
	return (await import("../_libs/nodemailer.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).createTransport({
		host,
		port,
		secure: port === 465,
		auth: {
			user,
			pass
		}
	});
}
var sendContactEmail_createServerFn_handler = createServerRpc({
	id: "8ea8690aaab80875cf482a126a44cd9f13ec49afc9b16a0316a32eb799705071",
	name: "sendContactEmail",
	filename: "src/lib/email.ts"
}, (opts) => sendContactEmail.__executeServer(opts));
var sendContactEmail = createServerFn({ method: "POST" }).validator((data) => contactMessageSchema.parse(data)).handler(sendContactEmail_createServerFn_handler, async ({ data }) => {
	rateLimit(`contact_${data.email}`, 5, 600 * 1e3);
	const transporter = await getTransporter();
	const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || "";
	const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";
	if (!adminEmail) return {
		success: false,
		error: "No admin email configured."
	};
	try {
		await transporter.sendMail({
			from: `"Aroma Cafe Contact" <${fromAddress}>`,
			to: adminEmail,
			replyTo: data.email,
			subject: `📨 New Contact Message from ${data.name}`,
			html: `
          <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
              <h1 style="font-size: 20px; font-weight: 800; color: #854d0e; margin: 0;">📨 New Contact Message</h1>
              <p style="font-size: 13px; color: #718096; margin: 4px 0 0 0;">Aroma Cafe — Contact Form</p>
            </div>
            <div style="padding: 20px 0;">
              <p style="margin: 4px 0;"><strong>From:</strong> ${escapeHtml(sanitizeInput(data.name))}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
            </div>
            <div style="background: #f7fafc; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${escapeHtml(sanitizeInput(data.message))}</div>
            <p style="margin-top: 16px; font-size: 12px; color: #a0aec0;">Reply directly to this email to respond to ${sanitizeInput(data.name)}.</p>
          </div>
        `
		});
		return { success: true };
	} catch (e) {
		console.error("Failed to send contact email:", e);
		return {
			success: false,
			error: e instanceof Error ? e.message : String(e)
		};
	}
});
//#endregion
export { sendContactEmail_createServerFn_handler };
