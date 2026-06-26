import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false
});

export const config = {
  // Matcher for internationalized pathnames, skipping api, next assets, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
