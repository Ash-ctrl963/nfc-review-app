/**
 * Isolated so tests can mock this module instead of fighting jsdom's
 * navigation restrictions.
 */
export function redirectTo(url: string): void {
  window.location.href = url;
}
