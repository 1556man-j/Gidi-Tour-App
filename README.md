# Gidi Tour — mobile app (Expo / React Native)

Native companion to the Gidi Tour website. It reads the **same Sanity CMS** and talks to the **same SvelteKit backend** (Supabase, Stripe, dLocal), so the website and app share content, accounts, bookings and orders.

Screens: onboarding, login / signup / forgot + reset password / email verification, Google sign-in, home, tours (search, filters, detail, save), 5-step booking + payment + confirmation, destinations, store (magazines, merch, cart, checkout, free issues, downloads), account (profile, avatar, bookings & orders, saved), stories, contact, careers, about, FAQ.

## 1. Run it in 2 minutes (demo mode)
```bash
npm install
npx expo start        # press i / a, or scan the QR with Expo Go
```
With no `.env`, the app runs on built-in sample data (any email/password signs in, payments are simulated). Good for showing the client.

## 2. Connect it to your real site
```bash
cp .env.example .env   # then fill it in (values are the same ones the website uses)
```
- `EXPO_PUBLIC_SANITY_PROJECT_ID` / `EXPO_PUBLIC_SANITY_DATASET` = website's `PUBLIC_SANITY_*`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` = website's `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_URL` = where the site is hosted (e.g. `https://www.giditour.com`)
- Google sign-in (optional): `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`

### Backend patch (needed once, ~10 files)
The website logs people in with browser cookies, which a phone app can't use. `backend-patch/` adds token login and a few read endpoints. Copy it into the website repo, keeping the folder structure:

- `src/hooks.server.ts` — **replaces** yours (only adds `mobileBridge` + a CSRF exemption for the app; compare with your current file first)
- `src/lib/server/mobileSession.ts`
- `src/routes/api/mobile/{login,google,bootstrap,me,bookings,orders}/…`

Everything else (signup, forgot/reset password, profile, avatar, contact, booking and store checkout) uses your **existing** endpoints unchanged. If you use Google sign-in with native iOS/Android client IDs, set `MOBILE_GOOGLE_CLIENT_IDS="iosId,androidId"` on the server.

## 3. Build for the stores
```bash
npm i -g eas-cli && eas login && eas build:configure
eas build -p android   # and -p ios
```
Bundle IDs are `com.giditour.app` (change in `app.json`). For Apple Pay set your merchant id in `app.json` (`@stripe/stripe-react-native` plugin). Stripe's payment sheet does not run in a web browser; use a phone or an EAS dev build.

## Notes
- Payments are confirmed only by the server (webhooks), never by the app; the app polls until the status is `paid`.
- dLocal (Nigeria, Ghana, Kenya, etc.) opens in an in-app browser; the person taps Done and the app confirms. For a smoother return, have the dLocal return route redirect to `giditour://`.
- Currency and payment provider are decided server-side from the visitor's IP, same as the website.
- Folder map: `src/app` screens · `src/components` UI · `src/lib` API, CMS, formatting · `src/stores` state · `src/theme` brand.
