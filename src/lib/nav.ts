import { router } from 'expo-router';

/** Goes back if there is a screen to go back to, otherwise to a sensible place (e.g. after login replaced the history). */
export function goBack(fallback: string = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}
