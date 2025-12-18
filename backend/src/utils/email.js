import { Resend } from 'resend';
import config from '../config/env.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async ({ to, subject, html, from }) => {
  if (!to) throw new Error('Email recipient is required');
  if (!resend) throw new Error('Resend API key is missing');
  const defaultSender = config.email.from || 'onboarding@resend.dev';
  const brandName = process.env.EMAIL_FROM_NAME || 'Unimall';
  const fromAddress =
    from ||
    (defaultSender.includes('<') ? defaultSender : `${brandName} <${defaultSender}>`);

  const result = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
  });

  if (result?.error) {
    throw new Error(result.error.message || 'Failed to send email');
  }
  return result;
};
