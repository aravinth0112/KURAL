import nodemailer from "nodemailer";

export interface TeamApplicationData {
  name: string;
  email: string;
  phone?: string;
  department: string;
  batch: string;
  interest_area: string;
  message?: string;
  created_at?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Creates and returns a nodemailer transporter configured via environment variables.
 * Supported env vars:
 * - SMTP_HOST (default: smtp.gmail.com)
 * - SMTP_PORT (default: 465)
 * - SMTP_SECURE (default: true for port 465)
 * - SMTP_USER (e.g. contact.kurallpu@gmail.com)
 * - SMTP_PASS (e.g. Gmail 16-character App Password)
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== "false" && port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatches an email if SMTP credentials are configured.
 * Gracefully falls back to server log if SMTP credentials are not yet set.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; emailSent: boolean; error?: string }> {
  const transporter = getMailTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "contact.kurallpu@gmail.com";
  const from = `"Kural LPU" <${fromAddress}>`;

  if (!transporter) {
    console.log(
      `[Email Service Notice] SMTP_USER or SMTP_PASS is not configured in .env.local.\n` +
      `Email simulation for: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}\n` +
      `Subject: ${options.subject}\n` +
      `To enable live delivery, add SMTP_USER and SMTP_PASS (Gmail App Password) to .env.local.`
    );
    return { success: true, emailSent: false };
  }

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]+>/g, " "),
      html: options.html,
      replyTo: options.replyTo,
    });
    return { success: true, emailSent: true };
  } catch (error: any) {
    console.error("[Email Service Error]:", error?.message || error);
    return { success: false, emailSent: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Generates and sends:
 * 1) A confirmation email to the applicant (at the email they provided)
 * 2) An alert notification email to the admin/coordinator team
 */
export async function sendTeamApplicationEmails(data: TeamApplicationData) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL || "contact.kurallpu@gmail.com";
  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  // 1. Applicant Confirmation Email HTML
  const applicantHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Application Received - Kural LPU</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Top Accent Bar -->
    <div style="height: 6px; background: linear-gradient(90deg, #f07f19 0%, #ea580c 100%);"></div>
    
    <div style="padding: 36px 32px;">
      
      <!-- Brand Header -->
      <div style="margin-bottom: 28px;">
        <span style="display: inline-block; padding: 4px 12px; background-color: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          Kural • LPU Tamizhans
        </span>
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 16px 0 8px 0; line-height: 1.25;">
          Vanakkam, ${data.name}!
        </h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">
          Thank you for applying to be part of the <strong>Kural LPU</strong> student committee at Lovely Professional University. We have successfully received your application.
        </p>
      </div>

      <!-- Application Summary Card -->
      <div style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 0 0 16px 0;">
          Your Submitted Application Details
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Full Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email Address:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.email}</td>
          </tr>
          ${data.phone ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">WhatsApp / Phone:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.phone}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Department:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.department}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Batch / Year:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.batch}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Area of Interest:</td>
            <td style="padding: 6px 0; color: #ea580c; font-weight: 700;">${data.interest_area}</td>
          </tr>
          ${data.message ? `
          <tr>
            <td style="padding: 10px 0 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Why Join:</td>
            <td style="padding: 10px 0 6px 0; color: #334155; font-style: italic;">&ldquo;${data.message}&rdquo;</td>
          </tr>` : ""}
        </table>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #fff7ed; border-left: 4px solid #f07f19; padding: 16px 20px; border-radius: 8px; margin-bottom: 28px;">
        <h4 style="margin: 0 0 6px 0; color: #9a3412; font-size: 14px; font-weight: 700;">What happens next?</h4>
        <p style="margin: 0; color: #c2410c; font-size: 13px; line-height: 1.5;">
          Our core coordinator team will review your application. We will reach out to you via WhatsApp or Email soon to connect with you and discuss the upcoming activities.
        </p>
      </div>

      <!-- Signoff -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px;">
        <p style="margin: 0 0 4px 0; color: #0f172a; font-weight: 700; font-size: 14px;">
          Kural Team • LPU Tamizhans
        </p>
        <p style="margin: 0; color: #64748b; font-size: 12px;">
          Lovely Professional University, Phagwara, Punjab<br/>
          Instagram: <a href="https://instagram.com/lputamizhans" style="color: #ea580c; text-decoration: none;">@lputamizhans</a> | Email: <a href="mailto:contact.kurallpu@gmail.com" style="color: #ea580c; text-decoration: none;">contact.kurallpu@gmail.com</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;

  // 2. Admin / Coordinator Notification Email HTML
  const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Team Application</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <div style="height: 6px; background: #f07f19;"></div>
    
    <div style="padding: 32px;">
      <span style="display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #b91c1c; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
        New Team Application
      </span>
      
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 14px 0 6px 0;">
        ${data.name} applied for ${data.interest_area}
      </h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0;">
        Received on ${formattedDate} via the "Be Part of Our Team" form on website.
      </p>

      <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Applicant:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #ea580c; text-decoration: none; font-weight: 600;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Department:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.department}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Batch:</td>
            <td style="padding: 6px 0; color: #0f172a;">${data.batch}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Interest Area:</td>
            <td style="padding: 6px 0; color: #ea580c; font-weight: 700;">${data.interest_area}</td>
          </tr>
          ${data.message ? `
          <tr>
            <td style="padding: 10px 0 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Why Join:</td>
            <td style="padding: 10px 0 6px 0; color: #1e293b; font-style: italic;">&ldquo;${data.message}&rdquo;</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <a href="mailto:${data.email}?subject=Regarding%20your%20Kural%20LPU%20Team%20Application" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
          Reply to ${data.name}
        </a>
      </div>

      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        This submission has also been logged to your Supabase <strong>team_applications</strong> database table and is viewable in the Admin Dashboard.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Send to applicant (the email provided in the form)
  const applicantResult = await sendEmail({
    to: data.email,
    subject: `Application Received: Kural LPU Team - ${data.name}`,
    html: applicantHtml,
    replyTo: adminEmail,
  });

  // Send to admin coordinator
  const adminResult = await sendEmail({
    to: adminEmail,
    subject: `🔔 New Team Application: ${data.name} (${data.interest_area})`,
    html: adminHtml,
    replyTo: data.email,
  });

  return {
    success: true,
    emailSent: applicantResult.emailSent || adminResult.emailSent,
    applicantEmailSent: applicantResult.emailSent,
    adminEmailSent: adminResult.emailSent,
  };
}
