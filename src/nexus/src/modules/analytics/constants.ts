/**
 * User-facing copy for chart-configuration load failures.
 *
 * The chart list is hydrated by `preferencesService.getCharts`, whose backend
 * error path historically leaked server-internal wording (e.g. a raw axios
 * message or an unmatched backend diagnostic string) into `ErrorState` via
 * `getUserFriendlyErrorMessage`. These surfaces now render this fixed message
 * instead of any backend-provided text — the diagnostic is preserved only as a
 * non-enumerable `cause` on the thrown error for logging/debugging.
 */
export const CHART_LOAD_ERROR_MESSAGE =
  'We could not load your charts right now. Please try again.';
