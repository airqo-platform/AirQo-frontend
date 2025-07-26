export function respectsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getAnimationDuration(duration = 300) {
  return respectsReducedMotion() ? 0 : duration;
}

export function createFadeInAnimation(element, duration = 300) {
  if (!element) return;
  const animationDuration = getAnimationDuration(duration);
  element.style.opacity = '0';
  element.style.transition = `opacity ${animationDuration}ms ease`;
  element.offsetHeight;
  element.style.opacity = '1';
  return new Promise((resolve) => {
    setTimeout(resolve, animationDuration);
  });
}

export function createSlideInAnimation(
  element,
  direction = 'up',
  duration = 300,
) {
  if (!element) return;
  const animationDuration = getAnimationDuration(duration);
  const transforms = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  };
  element.style.opacity = '0';
  element.style.transform = transforms[direction] || transforms.up;
  element.style.transition = `opacity ${animationDuration}ms ease, transform ${animationDuration}ms ease`;
  element.offsetHeight;
  element.style.opacity = '1';
  element.style.transform = 'translate(0, 0)';
  return new Promise((resolve) => {
    setTimeout(resolve, animationDuration);
  });
}

export function createPulseAnimation(element, scale = 1.1, duration = 600) {
  if (!element || respectsReducedMotion()) return;
  element.style.animation = `walkthrough-pulse ${duration}ms ease-in-out infinite`;
}

export function removePulseAnimation(element) {
  if (!element) return;
  element.style.animation = '';
}
