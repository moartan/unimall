import axios from 'axios';
import createError from 'http-errors';
import User from '../../models/auth/User.js';
import {
  createSession,
  issueTokens,
  setRefreshCookie,
  logAction,
  notify,
} from './authService.js';
import { hashToken } from '../../utils/tokens.js';

const PROVIDERS = ['google', 'facebook', 'apple'];

const ensureProvider = (provider) => {
  if (!PROVIDERS.includes(provider)) throw createError(400, 'Unsupported provider');
};

const envConfigPresent = (provider) => {
  if (provider === 'google') return process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (provider === 'facebook') return process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET;
  if (provider === 'apple')
    return (
      process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY
    );
  return false;
};

const buildAuthUrl = (provider, redirectUri) => {
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
  if (provider === 'facebook') {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
    });
    return `https://www.facebook.com/v16.0/dialog/oauth?${params.toString()}`;
  }
  if (provider === 'apple') {
    return 'https://appleid.apple.com/auth/authorize';
  }
  throw createError(400, 'Unsupported provider');
};

const fetchGoogleProfile = async ({ code, redirectUri }) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });
  const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const { access_token } = tokenRes.data;
  const userRes = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { sub, email, name, picture, email_verified } = userRes.data;
  return {
    providerId: sub,
    email,
    name,
    avatar: picture,
    emailVerified: !!email_verified,
  };
};

const fetchFacebookProfile = async ({ code, redirectUri }) => {
  const tokenRes = await axios.get('https://graph.facebook.com/v16.0/oauth/access_token', {
    params: {
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    },
  });
  const accessToken = tokenRes.data.access_token;
  const userRes = await axios.get('https://graph.facebook.com/me', {
    params: {
      access_token: accessToken,
      fields: 'id,name,email',
    },
  });
  const { id, email, name } = userRes.data;
  return {
    providerId: id,
    email,
    name,
    emailVerified: !!email,
  };
};

const upsertSocialUser = async ({ provider, providerId, email, name, avatar, emailVerified }) => {
  let user = await User.findOne({ provider, providerId });
  if (!user && email) {
    user = await User.findOne({ email });
    if (user) {
      user.provider = provider;
      user.providerId = providerId;
      if (!user.name && name) user.name = name;
      if (!user.avatar && avatar) user.avatar = avatar;
      user.emailVerified = emailVerified;
      user.isVerified = emailVerified;
      user.isVerify = emailVerified;
      await user.save();
    }
  }
  if (!user) {
    user = await User.create({
      role: 'customer',
      provider,
      providerId,
      email,
      name,
      avatar,
      emailVerified,
      isVerified: emailVerified,
      isVerify: emailVerified,
      status: 'active',
    });
    await notify(user._id, { title: 'Welcome to Unimall', body: 'Thanks for joining Unimall!' });
  }
  return user;
};

export const socialStart = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { redirectUri } = req.query;
    ensureProvider(provider);
    if (!redirectUri) throw createError(400, 'redirectUri required');
    if (!envConfigPresent(provider)) throw createError(400, `Configure ${provider} OAuth env vars first`);
    const url = buildAuthUrl(provider, redirectUri);
    res.json({ url });
  } catch (err) {
    next(err);
  }
};

export const socialCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, redirectUri } = req.body;
    ensureProvider(provider);
    if (!code || !redirectUri) throw createError(400, 'code and redirectUri required');
    if (!envConfigPresent(provider)) throw createError(400, `Configure ${provider} OAuth env vars first`);

    let profile;
    if (provider === 'google') {
      profile = await fetchGoogleProfile({ code, redirectUri });
    } else if (provider === 'facebook') {
      profile = await fetchFacebookProfile({ code, redirectUri });
    } else {
      throw createError(501, 'Apple login not implemented yet');
    }

    const user = await upsertSocialUser({
      provider,
      providerId: profile.providerId,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      emailVerified: profile.emailVerified,
    });

    const { accessToken, refreshToken } = issueTokens(user, null);
    const session = await createSession(user._id, refreshToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      metadata: { type: `login_${provider}` },
    });
    const rotated = issueTokens(user, session._id);
    session.refreshTokenHash = hashToken(rotated.refreshToken);
    await session.save();
    setRefreshCookie(res, rotated.refreshToken);
    await logAction(user._id, `${provider}_login`, { ip: req.ip, userAgent: req.headers['user-agent'] });

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.__v;
    res.json({ user: safeUser, accessToken: rotated.accessToken });
  } catch (err) {
    next(err);
  }
};
