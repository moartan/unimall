import nodemailer from 'nodemailer';
import config from '../config/env.js';

let transporter;

// Lazily build transporter so we can validate envs at send time and reuse the instance.
const getTransporter = () => {
  if (transporter) return transporter;
  const { host, port, user, pass } = config.email;
  if (!host || !port || !user || !pass) {
    throw new Error('Email transport is not fully configured (missing host/port/user/pass)');
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html, from }) => {
  if (!to) throw new Error('Email recipient is required');
  const mailer = getTransporter();
  const fromAddress = from || config.email.from || config.email.user;
  return mailer.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
};
