import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// ── Transporter factory ───────────────────────────────────────────────────────

const createTransporter = () => {
    if (process.env.NODE_ENV === 'test') {
        // Use Ethereal (fake SMTP) in test environments
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user: config.email.user, pass: config.email.pass },
        });
    }

    return nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
            user: config.email.user,
            pass: config.email.pass,
        },
    });
};

// ── Base send function ────────────────────────────────────────────────────────

/**
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''), // auto-generate plain text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`📧 Email sent to ${to} → MessageId: ${info.messageId}`);

        // Log Ethereal preview URL in development
        if (process.env.NODE_ENV !== 'production') {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) logger.info(`📬 Preview: ${previewUrl}`);
        }

        return info;
    } catch (err) {
        logger.error(`❌ Failed to send email to ${to}: ${err.message}`);
        throw err;
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// Email Templates
// ══════════════════════════════════════════════════════════════════════════════

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI-Nexus</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f0f1a; font-family: 'Segoe UI', Arial, sans-serif; color: #e2e8f0; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d4e; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.75); }
    .body { padding: 40px; }
    .body p { line-height: 1.7; color: #cbd5e1; font-size: 15px; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .note { background: #12122a; border-left: 3px solid #6366f1; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #94a3b8; margin-top: 24px; }
    .footer { text-align: center; padding: 24px 40px; font-size: 12px; color: #475569; border-top: 1px solid #2d2d4e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚡ AI-Nexus</h1>
      <p>Your AI-powered platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} AI-Nexus. All rights reserved.<br/>
      If you did not request this email, please ignore it.
    </div>
  </div>
</body>
</html>
`;

// ── Specific email senders ────────────────────────────────────────────────────

/**
 * Send email verification link.
 * @param {{ name: string, email: string, token: string }} user
 */
export const sendVerificationEmail = async ({ name, email, token }) => {
    const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;

    await sendEmail({
        to: email,
        subject: '✅ Verify your AI-Nexus email address',
        html: baseLayout(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to <strong>AI-Nexus</strong>! Please verify your email address to activate your account.</p>
      <p style="text-align:center;">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </p>
      <div class="note">
        This link expires in <strong>24 hours</strong>.<br/>
        If the button doesn't work, copy and paste this URL:<br/>
        <span style="word-break:break-all;">${verifyUrl}</span>
      </div>
    `),
    });
};

/**
 * Send password reset link.
 * @param {{ name: string, email: string, token: string }} user
 */
export const sendPasswordResetEmail = async ({ name, email, token }) => {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

    await sendEmail({
        to: email,
        subject: '🔑 Reset your AI-Nexus password',
        html: baseLayout(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset the password for your AI-Nexus account. Click the button below to choose a new password.</p>
      <p style="text-align:center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <div class="note">
        This link expires in <strong>10 minutes</strong>.<br/>
        If you did not request a password reset, you can safely ignore this email.<br/>
        If the button doesn't work, copy and paste:<br/>
        <span style="word-break:break-all;">${resetUrl}</span>
      </div>
    `),
    });
};

/**
 * Send password-changed confirmation.
 * @param {{ name: string, email: string }} user
 */
export const sendPasswordChangedEmail = async ({ name, email }) => {
    await sendEmail({
        to: email,
        subject: '🔒 Your AI-Nexus password was changed',
        html: baseLayout(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>This is a confirmation that the password for your AI-Nexus account was successfully changed.</p>
      <p>If you did not make this change, please <a href="${config.clientUrl}/forgot-password" style="color:#818cf8;">reset your password immediately</a> or contact our support team.</p>
    `),
    });
};
