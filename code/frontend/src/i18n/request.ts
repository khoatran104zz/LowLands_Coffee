import {getRequestConfig} from 'next-intl/server';
import {locales, Locale} from './config';

export default getRequestConfig(async ({locale}) => {
  const baseLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'vi';

  return {
    locale: baseLocale,
    messages: (await import(`../messages/${baseLocale}.json`)).default
  };
});
