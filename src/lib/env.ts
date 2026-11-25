const clean = (v?: string) => (v ?? '').trim();

// Google sign-in on a phone needs the Google ID made for that kind of phone. If it is missing, the app
// treats Google sign-in as "not set up" and hides the button, instead of crashing the sign-in page.
const googleWeb = clean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
const googleIos = clean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
const googleAndroid = clean(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
// On a phone the Google button uses the native Google sheet, which only needs the web client ID (plus the iOS one on iPhone).
const googleReady = !!googleWeb;

export const env = {
  // Public website, used for links that open in the browser (terms, privacy, reports). Not the API.
  siteUrl: (clean(process.env.EXPO_PUBLIC_SITE_URL) || 'https://giditour.com').replace(/\/+$/, ''),
  apiUrl: clean(process.env.EXPO_PUBLIC_API_URL) || 'https://giditour.com',
  sanityProjectId: clean(process.env.EXPO_PUBLIC_SANITY_PROJECT_ID),
  sanityDataset: clean(process.env.EXPO_PUBLIC_SANITY_DATASET) || 'production',
  stripeKey: clean(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  googleWebClientId: googleReady ? googleWeb : '',
  googleIosClientId: googleReady ? googleIos : '',
  googleAndroidClientId: googleReady ? googleAndroid : '',
  // Mock mode runs everything on bundled sample data. It is on when asked for,
  // or when no Sanity project has been configured yet.
  mock: clean(process.env.EXPO_PUBLIC_MOCK) === '1' || !clean(process.env.EXPO_PUBLIC_SANITY_PROJECT_ID),
};

if (__DEV__) console.log(`[gidi] mock=${env.mock} sanity=${env.sanityProjectId || '(none)'}/${env.sanityDataset} api=${env.apiUrl}`);
