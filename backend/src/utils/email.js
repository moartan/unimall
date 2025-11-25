import nodemailer from 'nodemailer';
import config from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: Number(config.email.port) === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!config.email.user || !config.email.pass) {
    throw new Error('Email credentials are not configured');
  }
  return transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
  });
};
