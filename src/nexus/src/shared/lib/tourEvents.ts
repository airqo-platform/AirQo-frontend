/**
 * Window event broadcast by the ProductTour overlay so any module can follow
 * the current tour step without importing from `@/modules/home/...`.
 *
 * Lives in `shared/lib` because listeners exist outside the home module
 * (e.g. the data-download export sidebar re-opens itself on each step).
 */
export const PRODUCT_TOUR_STEP_EVENT = 'nexus-product-tour-step';

/** `detail` payload carried by {@link PRODUCT_TOUR_STEP_EVENT}. */
export interface ProductTourStepEventDetail {
  /** `data-tour` selector of the active step, or `null` when the tour idles/ends. */
  target: string | null;
}
