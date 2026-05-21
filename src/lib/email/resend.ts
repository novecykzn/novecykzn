import { Resend } from "resend";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = () => process.env.FROM_EMAIL ?? "noreply@example.com";
const adminEmail = () => process.env.ADMIN_EMAIL;

export async function sendAdminNewApplication(payload: {
  applicationId: string;
  applicantName: string;
  company: string;
  email: string;
}) {
  const resend = client();
  const to = adminEmail();
  if (!resend || !to) {
    console.warn("[email] Skipping admin notification: RESEND or ADMIN_EMAIL missing");
    return { skipped: true as const };
  }
  await resend.emails.send({
    from: from(),
    to,
    subject: `New portal application — ${payload.company}`,
    html: `
      <h2>New healthcare provider application</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.applicantName)}</p>
      <p><strong>Organisation:</strong> ${escapeHtml(payload.company)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Application ID:</strong> ${escapeHtml(payload.applicationId)}</p>
      <p>Review in the admin dashboard.</p>
    `,
  });
  return { ok: true as const };
}

export async function sendApplicantConfirmation(email: string, name: string) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: email,
    subject: "We received your access application",
    html: `
      <p>Dear ${escapeHtml(name)},</p>
      <p>Thank you for your application to access the Novecy CP KZN ordering portal.</p>
      <p>Our team is reviewing your submission and will contact you by email once the review is complete.</p>
      <p>Kind regards,<br/>Novecy CP KZN</p>
    `,
  });
  return { ok: true as const };
}

export async function sendApprovalInvite(payload: {
  email: string;
  name: string;
  inviteLink: string;
}) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: payload.email,
    subject: "Your portal access is approved",
    html: `
      <p>Dear ${escapeHtml(payload.name)},</p>
      <p>Your application has been approved. You can sign in to place orders:</p>
      <p><a href="${payload.inviteLink}">${escapeHtml(payload.inviteLink)}</a></p>
      <p>If the link expires, use &quot;Forgot password&quot; on the login page with this email address.</p>
    `,
  });
  return { ok: true as const };
}

export async function sendRejection(email: string, name: string, reason?: string) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: email,
    subject: "Update on your access application",
    html: `
      <p>Dear ${escapeHtml(name)},</p>
      <p>We are unable to approve portal access at this time.${reason ? ` Note: ${escapeHtml(reason)}` : ""}</p>
      <p>If you believe this is an error, please contact us.</p>
    `,
  });
  return { ok: true as const };
}

export async function sendEftOrderConfirmation(payload: {
  email: string;
  orderId: string;
  totalZar: string;
  reference: string;
  popEmail: string;
}) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: payload.email,
    subject: `EFT instructions — order ${payload.reference}`,
    html: `
      <p>Thank you for your order. Your order is on our order tracker.</p>
      <p><strong>Our team will await your proof of payment (POP) before starting your order.</strong></p>
      <p><strong>Amount due:</strong> ${escapeHtml(payload.totalZar)}</p>
      <p><strong>EFT reference (use exactly):</strong> ${escapeHtml(payload.reference)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
      <p>After paying by EFT, email your proof of payment (POP) to <strong>${escapeHtml(payload.popEmail)}</strong> with reference ${escapeHtml(payload.reference)} in the subject line.</p>
      <p>Once we verify your POP, we will pack and dispatch your order.</p>
      <p>Your order will be sent to the approved delivery address on your profile. To change the shipping address for this order, email ${escapeHtml(payload.popEmail)} before we pack.</p>
      <p>Log in to the portal for full banking details.</p>
    `,
  });
  return { ok: true as const };
}

export async function sendOnAccountOrderConfirmation(payload: {
  email: string;
  orderId: string;
  totalZar: string;
}) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: payload.email,
    subject: `On-account order submitted — ${payload.orderId.slice(0, 8)}…`,
    html: `
      <p>Your order has been submitted on account.</p>
      <p><strong>Order reference:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Total:</strong> ${escapeHtml(payload.totalZar)}</p>
      <p>Our team will process it according to your agreement with Novecy CP KZN.</p>
    `,
  });
  return { ok: true as const };
}

export async function sendOrderConfirmation(payload: {
  email: string;
  orderId: string;
  totalZar: string;
}) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: payload.email,
    subject: `Order received — ${payload.orderId.slice(0, 8)}…`,
    html: `
      <p>Your order has been recorded.</p>
      <p><strong>Order reference:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Total:</strong> ${escapeHtml(payload.totalZar)}</p>
    `,
  });
  return { ok: true as const };
}

export async function sendPaymentConfirmation(payload: {
  email: string;
  orderId: string;
  amountZar: string;
}) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: payload.email,
    subject: `Payment confirmed — ${payload.orderId.slice(0, 8)}…`,
    html: `
      <p>Payment has been confirmed for your order.</p>
      <p><strong>Order:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Amount:</strong> ${escapeHtml(payload.amountZar)}</p>
    `,
  });
  return { ok: true as const };
}

export async function sendOrderPackedNotification(payload: {
  email: string;
  name: string;
  orderId: string;
  trackingNumber: string;
  courier?: string | null;
  trackingUrl?: string | null;
}) {
  const resend = client();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from: from(),
    to: payload.email,
    subject: `Your order has been packed — ${payload.orderId.slice(0, 8)}…`,
    html: `
      <p>Dear ${escapeHtml(payload.name)},</p>
      <p>Your Novecy CP KZN order has been packed and is ready for shipment.</p>
      <p><strong>Order reference:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Tracking number:</strong> ${escapeHtml(payload.trackingNumber)}</p>
      ${
        payload.courier
          ? `<p><strong>Courier:</strong> ${escapeHtml(payload.courier)}</p>`
          : ""
      }
      ${
        payload.trackingUrl
          ? `<p><strong>Track shipment:</strong> <a href="${escapeHtml(payload.trackingUrl)}">${escapeHtml(
              payload.trackingUrl,
            )}</a></p>`
          : ""
      }
      <p>Kind regards,<br/>Novecy CP KZN</p>
    `,
  });
  return { ok: true as const };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
