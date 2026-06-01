/** Home intro scroll distance — hero opacity and content reveal stay in sync. */
export const LANDING_INTRO_FADE_DISTANCE_PX = 520;

export function isLandingIntroRoute(pathname: string): boolean {
  return pathname === "/";
}
