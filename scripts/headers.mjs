// Security headers for the hosted page. netlify.toml and vercel.json repeat these values;
// tests/config.test.mjs fails if the three ever drift apart.
export const HEADERS = {
  'Content-Security-Policy': [
    "default-src 'none'",
    "script-src 'self'",
    // Inline styles are needed: the letter is built from inline-styled tables, exactly as it is pasted into an email.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data: blob: https:",
    "connect-src 'self' data: blob:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
