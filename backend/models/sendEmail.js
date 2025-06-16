import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Reusable email sending function
const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL, // Must be verified in SendGrid
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log("Verification email sent to:", to);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
  }
};

export default sendEmail;
