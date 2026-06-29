import {getRequestConfig} from 'next-intl/server';
import {locales, Locale} from './config';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  const baseLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'vi';

  const files = ['common', 'header', 'footer', 'landing', 'product', 'auth', 'admin', 'staff'];
  const messages: Record<string, any> = {};

  for (const file of files) {
    try {
      messages[file] = (await import(`../locales/${baseLocale}/${file}.json`)).default;
    } catch (error) {
      console.error(`Failed to load translation file: ${file} for locale: ${baseLocale}`, error);
    }
  }

  return {
    locale: baseLocale,
    messages
  };
});

