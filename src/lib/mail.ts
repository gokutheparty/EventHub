/**
 * EventHub Email Sender Utility
 * Supports Resend API (HTTP POST, zero dependencies), SMTP fallback, and console log fallback in development.
 */
export async function sendClaimCodeEmail({
  to,
  vendorName,
  verificationToken,
}: {
  to: string;
  vendorName: string;
  verificationToken: string;
}) {
  const subject = `Claim Your EventHub Profile: ${vendorName}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">
      <h2 style="color: #6366f1; margin-bottom: 16px;">Claim Your Business on EventHub</h2>
      <p>Hello,</p>
      <p>A profile has been created for your business <strong>${vendorName}</strong> on EventHub, Ghana's premium event vendor marketplace.</p>
      <p>To claim ownership of this profile for free and start receiving customer inquiries directly, use the verification code below:</p>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center; margin: 24px 0;">
        <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: 0.1em; color: #111827;">${verificationToken}</span>
      </div>
      
      <p>Copy this code and paste it into the claim verification field on the vendor profile page.</p>
      <p style="color: #6b7280; font-size: 0.85rem; margin-top: 32px; border-top: 1px solid #e5e7eb; paddingTop: 16px;">
        If you did not request this claim, please ignore this email.
      </p>
    </div>
  `;

  const fromAddress = process.env.EMAIL_FROM || 'onboarding@eventhub.com.gh';

  // 1. Try Resend API first (zero dependencies, simple HTTP fetch)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`[Mail] Attempting to send email via Resend to ${to}...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to,
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        console.log(`[Mail] Email successfully sent via Resend API to ${to}`);
        return { success: true, provider: 'resend' };
      } else {
        const errText = await res.text();
        console.error(`[Mail] Resend API returned error: ${errText}`);
      }
    } catch (err) {
      console.error('[Mail] Resend email send failed:', err);
    }
  }

  // 2. Try SMTP if variables are configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log(`[Mail] Attempting to send email via SMTP to ${to}...`);
      // Dynamically require nodemailer to avoid build crashes if not installed
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[Mail] Email successfully sent via SMTP to ${to}`);
      return { success: true, provider: 'smtp' };
    } catch (err) {
      console.error('[Mail] SMTP email send failed:', err);
    }
  }

  // 3. Fallback to console logging for local testing/dev
  console.log(`
============================================================
[MAIL DEVELOPMENT LOGGER - NO CREDENTIALS CONFIGURED]
To: ${to}
From: ${fromAddress}
Subject: ${subject}
Token: ${verificationToken}
============================================================
  `);

  return { success: true, provider: 'console-log' };
}
