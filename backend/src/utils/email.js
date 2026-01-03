import sgMail from '@sendgrid/mail';
import config from '../config/env.js';

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export const sendEmail = async ({ to, subject, html, from }) => {
  if (!apiKey) throw new Error('SendGrid API key is missing');
  if (!to) throw new Error('Email recipient is required');

  const brandName = process.env.EMAIL_FROM_NAME || 'Unimall';
  const defaultSender = config.email.from || 'no-reply@unimall.com';
  const fromAddress = from || (defaultSender.includes('<') ? defaultSender : `${brandName} <${defaultSender}>`);

  try {
    const [response] = await sgMail.send({
      to,
      from: fromAddress,
      subject,
      html,
    });

    if (response?.statusCode >= 400) {
      throw new Error(`SendGrid failed with status ${response.statusCode}`);
    }
    return response;
  } catch (err) {
    const sgErrors = err?.response?.body?.errors;
    const message =
      (Array.isArray(sgErrors) && sgErrors.map((e) => e.message).join('; ')) ||
      err?.message ||
      'Failed to send email';
    throw new Error(message);
  }
};
