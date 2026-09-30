import { getOAuthHandoffScript, OAUTH_HANDOFF_ATTRIBUTE } from './oauth-session';

const runHandoffScriptAt = (url: string) => {
  window.history.replaceState({}, '', url);
  new Function(getOAuthHandoffScript())();
  return document.documentElement.hasAttribute(OAUTH_HANDOFF_ATTRIBUTE);
};

describe('getOAuthHandoffScript', () => {
  afterEach(() => {
    document.documentElement.removeAttribute(OAUTH_HANDOFF_ATTRIBUTE);
    window.history.replaceState({}, '', '/');
  });

  it('marks the page while /login carries an OAuth token handoff', () => {
    expect(runHandoffScriptAt('/login#token=abc&callbackUrl=%2Fhome')).toBe(true);
  });

  it('leaves /login alone when there is no token in the hash', () => {
    expect(runHandoffScriptAt('/login')).toBe(false);
    expect(runHandoffScriptAt('/login?callbackUrl=%2Fhome#section')).toBe(false);
  });

  it('leaves other routes alone, which keep their own loading state', () => {
    expect(runHandoffScriptAt('/home#token=abc')).toBe(false);
  });
});
