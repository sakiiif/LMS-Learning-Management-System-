import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        accessTokenLifespan: 60 * 60 * 24, // 1 day
        maxRefreshTokenLifespan: 60 * 60 * 24 * 30, // 30 days
        idleRefreshTokenLifespan: 60 * 60 * 24 * 14, // 14 days
        maxSessionLifespan: 60 * 60 * 24 * 7, // 7 days
        idleSessionLifespan: 60 * 60 * 24, // 1 day
        httpOnly: true,
        cookie: {
          secure: env('NODE_ENV') === 'production',
        },
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;