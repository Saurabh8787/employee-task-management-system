const nodemailer = require('nodemailer');

const isEnabled = () => process.env.EMAIL_ENABLED === 'true';

let transporter = null;
if (isEnabled()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// Fails silently (logs only) so email issues never break the main request flow
const sendEmail = async ({ to, subject, text }) => {
  if (!isEnabled() || !transporter) {
    console.log(`[Email disabled] Would send to ${to}: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

module.exports = { sendEmail };
