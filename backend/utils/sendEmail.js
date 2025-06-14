// backend/utils/sendEmail.js
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to, subject, html) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    });
    console.log("📧 Email sent to", to);
  } catch (error) {
    console.error("❌ SendGrid email error:", error.response?.body || error.message);
  }
}
