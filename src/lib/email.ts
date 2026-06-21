// src/lib/email.ts
// Server functions for sending emails using Nodemailer.
// Reads credentials from process.env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return a dummy transporter for development/fallback
    console.warn(
      "SMTP credentials missing in .env. Email sending will be logged to console instead.",
    );
    return {
      sendMail: async (options: any) => {
        console.log("--- MOCK EMAIL SENT ---");
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`HTML: ${(options.html as string).substring(0, 300)}...`);
        return { messageId: "mock-id-" + Date.now() };
      },
    };
  }

  // Dynamic import to avoid bundling nodemailer on client
  const nodemailer = await import("nodemailer");
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const inrFormat = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// 1. Order Confirmation / Receipt Email
export async function sendOrderEmailInternal(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: { id: string; name: string; price: number; qty: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  cutlery: boolean;
}) {
  const transporter = await getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || "";

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 12px; color: #666;">Qty ${item.qty} · ${inrFormat(item.price)} each</div>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
          ${inrFormat(item.qty * item.price)}
        </td>
      </tr>`,
    )
    .join("");

  const htmlContent = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
          <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
          <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Thank you for your order, ${data.customerName}!</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #4a5568; margin: 0;">We have received your order <strong>#${data.orderId}</strong>. It is currently pending confirmation from our team. We'll update you as soon as it is accepted.</p>
        </div>

        <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Delivery Address</h3>
          <p style="font-size: 14px; margin: 0; color: #2d3748; line-height: 1.4;">${data.address}</p>
          <p style="font-size: 14px; margin: 6px 0 0 0; color: #2d3748;"><strong>Phone:</strong> ${data.customerPhone}</p>
          <p style="font-size: 14px; margin: 4px 0 0 0; color: #2d3748;"><strong>Cutlery Option:</strong> ${data.cutlery ? "Yes, please provide cutlery" : "No cutlery needed"}</p>
        </div>

        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid #edf2f7; color: #718096; font-weight: 600;">Item</th>
              <th style="text-align: right; padding-bottom: 8px; border-bottom: 1px solid #edf2f7; color: #718096; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #4a5568;">Subtotal</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${inrFormat(data.subtotal)}</td>
          </tr>
          ${
            data.discount > 0
              ? `
          <tr>
            <td style="padding: 6px 0; color: #e53e3e;">Discount Applied</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #e53e3e;">-${inrFormat(data.discount)}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 6px 0; color: #4a5568;">Delivery Fee</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${inrFormat(data.deliveryFee)}</td>
          </tr>
          <tr style="border-top: 2px solid #edf2f7; font-size: 16px; font-weight: 800;">
            <td style="padding: 12px 0; color: #1a202c;">Grand Total</td>
            <td style="padding: 12px 0; text-align: right; color: #854d0e;">${inrFormat(data.total)}</td>
          </tr>
        </table>

        <div style="text-align: center; padding: 10px 0 20px 0;">
          <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/track/${data.orderId}" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Track Your Order</a>
        </div>

        <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
          <p style="margin: 0 0 8px 0;">If you have any questions or need to make changes, please reply to this email or contact us at +91 80195 51015.</p>
          <p style="margin: 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
        </div>
      </div>
    `;

  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  // Send receipt to customer
  const userMailPromise = transporter.sendMail({
    from: `"Aroma Cafe" <${fromAddress}>`,
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderId} - Aroma Cafe`,
    html: htmlContent,
  });

  // Send alert to admin
  let adminMailPromise: Promise<unknown> = Promise.resolve(null);
  if (adminEmail) {
    adminMailPromise = transporter.sendMail({
      from: `"Aroma System" <${fromAddress}>`,
      to: adminEmail,
      subject: `🚨 NEW ORDER RECEIVED: #${data.orderId}`,
      html: `
          <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
              <h1 style="font-size: 20px; font-weight: 800; color: #e53e3e; margin: 0;">🚨 New Order Alert</h1>
            </div>
            <div style="padding: 20px 0;">
              <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 10px 0;">Order #${data.orderId}</h2>
              <p style="margin: 4px 0;"><strong>Customer:</strong> ${data.customerName}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
              <p style="margin: 4px 0;"><strong>Phone:</strong> ${data.customerPhone}</p>
              <p style="margin: 4px 0;"><strong>Total:</strong> ${inrFormat(data.total)}</p>
            </div>
            <div style="text-align: center; padding: 10px 0 10px 0;">
              <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/admin/orders" style="display: inline-block; background-color: #1a202c; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">Open Admin Dashboard</a>
            </div>
          </div>
        `,
    });
  }

  try {
    await Promise.all([userMailPromise, adminMailPromise]);
    return { success: true };
  } catch (e) {
    console.error("Failed to send order email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 2. Reservation Confirmation Email
export async function sendReservationEmailInternal(data: {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guests: number;
  date: string;
  timeSlot: string;
  location?: { address: string; placeId: string; latitude: number; longitude: number };
}) {
  const transporter = await getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || "";

  const locationLink = data.location
    ? `<p style="margin: 4px 0;"><strong>Location:</strong> <a href="https://www.google.com/maps/dir/?api=1&destination=${data.location.latitude},${data.location.longitude}&destination_place_id=${data.location.placeId}">${data.location.address}</a></p>`
    : "";

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Table Confirmed, ${data.customerName}!</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #4a5568; margin: 0;">Your table booking at Aroma Cafe is successfully confirmed! We look forward to welcoming you.</p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; border-radius: 12px; border: 1px solid #edf2f7; margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 12px 0; color: #718096; letter-spacing: 0.05em;">Reservation Details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #718096;">Booking ID</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right;">#${data.reservationId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #718096;">Date</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #718096;">Time Slot</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right;">${data.timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #718096;">Number of Guests</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right;">${data.guests} Guests</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0 0 8px 0;">Please arrive 10 minutes prior to your slot. If you need to cancel or modify your reservation, call us at +91 80195 51015.</p>
        <p style="margin: 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  let userMailPromise: Promise<unknown> = Promise.resolve(null);
  if (data.customerEmail) {
    userMailPromise = transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.customerEmail,
      subject: `Table Reservation Confirmed #${data.reservationId} - Aroma Cafe`,
      html: htmlContent,
    });
  }

  let adminMailPromise: Promise<unknown> = Promise.resolve(null);
  if (adminEmail) {
    adminMailPromise = transporter.sendMail({
      from: `"Aroma System" <${fromAddress}>`,
      to: adminEmail,
      subject: `📅 NEW TABLE RESERVATION: ID #${data.reservationId}`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
            <h1 style="font-size: 20px; font-weight: 800; color: #3182ce; margin: 0;">📅 New Reservation Alert</h1>
          </div>
          <div style="padding: 20px 0;">
            <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 10px 0;">Booking #${data.reservationId}</h2>
            <p style="margin: 4px 0;"><strong>Customer:</strong> ${data.customerName} (${data.customerPhone})</p>
            <p style="margin: 4px 0;"><strong>Guests:</strong> ${data.guests}</p>
            <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${data.date} at ${data.timeSlot}</p>
            ${locationLink}
          </div>
          <div style="text-align: center; padding: 10px 0 10px 0;">
            <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/admin/reservations" style="display: inline-block; background-color: #1a202c; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">Open Reservations</a>
          </div>
        </div>
      `,
    });
  }

  try {
    await Promise.all([userMailPromise, adminMailPromise]);
    return { success: true };
  } catch (e) {
    console.error("Failed to send reservation email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 3. Order Status Update Email
export async function sendOrderStatusEmailInternal(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  const statusMessages: Record<string, { title: string; message: string; icon: string }> = {
    "Pending": {
      title: "Order Received",
      message: "We've received your order and it's pending confirmation from our team.",
      icon: "📋"
    },
    "Confirmed": {
      title: "Order Confirmed",
      message: "Great news! Your order has been confirmed and is now being prepared.",
      icon: "✅"
    },
    "Preparing": {
      title: "Order Being Prepared",
      message: "Our chefs are working on your delicious order right now.",
      icon: "👨‍🍳"
    },
    "Ready": {
      title: "Order Ready for Pickup/Delivery",
      message: "Your order is ready! It will be delivered to you shortly.",
      icon: "🍕"
    },
    "Out for Delivery": {
      title: "Order Out for Delivery",
      message: "Your order is on its way to you!",
      icon: "🚚"
    },
    "Delivered": {
      title: "Order Delivered",
      message: "Your order has been delivered. Enjoy your meal!",
      icon: "🎉"
    },
    "Cancelled": {
      title: "Order Cancelled",
      message: "Your order has been cancelled. If you didn't request this, please contact us.",
      icon: "❌"
    }
  };

  const statusInfo = statusMessages[data.status] || statusMessages["Pending"];
  const itemsList = data.items.map(item => 
    `<li style="padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
      <span style="font-weight: 500;">${item.name}</span> × ${item.qty} - ${inrFormat(item.price * item.qty)}
    </li>`
  ).join("");

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">${statusInfo.icon}</div>
        <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">${statusInfo.title}</h2>
        <p style="font-size: 14px; color: #4a5568; margin: 0;">${statusInfo.message}</p>
      </div>

      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Order #${data.orderId}</h3>
        <p style="font-size: 14px; margin: 0; color: #2d3748;"><strong>Status:</strong> ${data.status}</p>
        <p style="font-size: 14px; margin: 6px 0 0 0; color: #2d3748;"><strong>Total:</strong> ${inrFormat(data.total)}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Order Items</h3>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
          ${itemsList}
        </ul>
      </div>

      <div style="text-align: center; padding: 20px 0;">
        <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/track/${data.orderId}" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Track Your Order</a>
      </div>

      <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0 0 8px 0;">If you have any questions, please contact us at +91 80195 51015.</p>
        <p style="margin: 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.customerEmail,
      subject: `${statusInfo.title} - Order #${data.orderId}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to send order status email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 4. Email Verification Email
export async function sendVerificationEmailInternal(data: {
  email: string;
  verificationLink: string;
}) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Verify your email address</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #4a5568; margin: 0;">
          Thanks for signing up for Aroma Cafe! Please verify your email address to complete your registration.
        </p>
      </div>

      <div style="text-align: center; padding: 20px 0;">
        <a href="${data.verificationLink}" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Verify Email Address
        </a>
      </div>

      <div style="padding: 20px 0; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p style="margin: 8px 0 0 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.email,
      subject: "Verify your email address - Aroma Cafe",
      html: htmlContent,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to send verification email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 4. Reservation Status Update Email
export async function sendReservationStatusEmailInternal(data: {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  date: string;
  timeSlot: string;
  guests: number;
}) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  const statusMessages: Record<string, { title: string; message: string; icon: string }> = {
    "Pending": {
      title: "Reservation Request Received",
      message: "We've received your reservation request and it's pending confirmation.",
      icon: "📋"
    },
    "Confirmed": {
      title: "Reservation Confirmed",
      message: "Great news! Your table reservation has been confirmed.",
      icon: "✅"
    },
    "Cancelled": {
      title: "Reservation Cancelled",
      message: "Your reservation has been cancelled. If you didn't request this, please contact us.",
      icon: "❌"
    },
    "Completed": {
      title: "Reservation Completed",
      message: "Thank you for dining with us! We hope you enjoyed your experience.",
      icon: "🎉"
    }
  };

  const statusInfo = statusMessages[data.status] || statusMessages["Pending"];

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">${statusInfo.icon}</div>
        <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">${statusInfo.title}</h2>
        <p style="font-size: 14px; color: #4a5568; margin: 0;">${statusInfo.message}</p>
      </div>

      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Reservation #${data.reservationId}</h3>
        <p style="font-size: 14px; margin: 0; color: #2d3748;"><strong>Status:</strong> ${data.status}</p>
        <p style="font-size: 14px; margin: 6px 0 0 0; color: #2d3748;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
        <p style="font-size: 14px; margin: 6px 0 0 0; color: #2d3748;"><strong>Time:</strong> ${data.timeSlot}</p>
        <p style="font-size: 14px; margin: 6px 0 0 0; color: #2d3748;"><strong>Guests:</strong> ${data.guests}</p>
      </div>

      <div style="text-align: center; padding: 20px 0;">
        <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/reservations" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Reservations</a>
      </div>

      <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0 0 8px 0;">If you need to make changes, please contact us at +91 80195 51015.</p>
        <p style="margin: 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.customerEmail,
      subject: `${statusInfo.title} - Reservation #${data.reservationId}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to send reservation status email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 5. Order Cancellation Email
export async function sendOrderCancellationEmailInternal(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  reason?: string;
}) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  const itemsList = data.items.map(item => 
    `<li style="padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
      <span style="font-weight: 500;">${item.name}</span> × ${item.qty} - ${inrFormat(item.price * item.qty)}
    </li>`
  ).join("");

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
        <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">Order Cancelled</h2>
        <p style="font-size: 14px; color: #4a5568; margin: 0;">Your order has been cancelled.</p>
      </div>

      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Order #${data.orderId}</h3>
        <p style="font-size: 14px; margin: 0; color: #2d3748;"><strong>Total:</strong> ${inrFormat(data.total)}</p>
        ${data.reason ? `<p style="font-size: 14px; margin: 6px 0 0 0; color: #2d3748;"><strong>Reason:</strong> ${data.reason}</p>` : ""}
      </div>

      <div style="margin: 20px 0;">
        <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0; color: #718096; letter-spacing: 0.05em;">Cancelled Items</h3>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
          ${itemsList}
        </ul>
      </div>

      <div style="text-align: center; padding: 20px 0;">
        <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/menu" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Order Again</a>
      </div>

      <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0 0 8px 0;">If you didn't request this cancellation, please contact us at +91 80195 51015.</p>
        <p style="margin: 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.customerEmail,
      subject: `Order Cancelled - Order #${data.orderId}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to send order cancellation email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 6. Review Approval Email
export async function sendReviewApprovalEmailInternal(data: {
  customerName: string;
  customerEmail: string;
  reviewText: string;
  rating: number;
  itemName?: string;
}) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  const stars = "⭐".repeat(data.rating);

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
        <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">Review Approved!</h2>
        <p style="font-size: 14px; color: #4a5568; margin: 0;">Thank you for your feedback! Your review has been approved and is now visible on our website.</p>
      </div>

      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <div style="font-size: 24px; margin-bottom: 8px;">${stars}</div>
        <p style="font-size: 14px; margin: 0; color: #2d3748; font-style: italic;">"${data.reviewText}"</p>
        ${data.itemName ? `<p style="font-size: 12px; margin: 8px 0 0 0; color: #718096;">Reviewed: ${data.itemName}</p>` : ""}
      </div>

      <div style="text-align: center; padding: 20px 0;">
        <a href="${process.env.VITE_APP_URL || "https://aroma.in"}/reviews" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">View All Reviews</a>
      </div>

      <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.customerEmail,
      subject: "Your review has been approved - Aroma Cafe",
      html: htmlContent,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to send review approval email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 7. Password Reset Email
export async function sendPasswordResetEmailInternal(data: {
  email: string;
  resetLink: string;
}) {
  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; color: #1a202c;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f7fafc;">
        <h1 style="font-size: 24px; font-weight: 800; color: #854d0e; margin: 0;">Aroma Cafe & Restaurant</h1>
        <p style="font-size: 14px; color: #718096; margin: 4px 0 0 0;">Brewed with love in Nalgonda</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Reset Your Password</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #4a5568; margin: 0;">
          We received a request to reset your password for your Aroma Cafe account. Click the button below to create a new password.
        </p>
      </div>

      <div style="text-align: center; padding: 20px 0;">
        <a href="${data.resetLink}" style="display: inline-block; background-color: #854d0e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>

      <div style="padding: 20px 0; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0;">This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.</p>
        <p style="margin: 8px 0 0 0;">Aroma Cafe & Restaurant, Clock Tower Road, Nalgonda, Telangana 508001</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aroma Cafe" <${fromAddress}>`,
      to: data.email,
      subject: "Reset your password - Aroma Cafe",
      html: htmlContent,
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to send password reset email:", e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// 8. Contact Form Email
import { contactMessageSchema } from "./validation/schemas";
import { rateLimit } from "./api/rate-limit";

export const sendContactEmail = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactMessageSchema.parse(data))
  .handler(async ({ data }) => {
    // Phase 6: Anti-spam rate limiting (5 req / 10 mins per email)
    rateLimit(`contact_${data.email}`, 5, 10 * 60 * 1000);
    const transporter = await getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || "";
    const fromAddress = process.env.SMTP_FROM || "no-reply@aromacafe.in";

    if (!adminEmail) return { success: false, error: "No admin email configured." };

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
              <p style="margin: 4px 0;"><strong>From:</strong> ${escapeHtml(data.name)}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
            </div>
            <div style="background: #f7fafc; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
            <p style="margin-top: 16px; font-size: 12px; color: #a0aec0;">Reply directly to this email to respond to ${data.name}.</p>
          </div>
        `,
      });
      return { success: true };
    } catch (e) {
      console.error("Failed to send contact email:", e);
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  });
