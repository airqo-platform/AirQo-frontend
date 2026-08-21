import { buildSystemPrompt, FEATURE_SUGGESTED_PROMPTS } from '../server/prompts';
import type { AiFeatureId } from '../types';

const ALL_FEATURES: AiFeatureId[] = [
  'home',
  'map',
  'data-export',
  'analytics',
  'data-visualizer',
  'rankings',
  'profile',
  'general',
];

describe('buildSystemPrompt', () => {
  it('includes the feature label for each feature', () => {
    for (const feature of ALL_FEATURES) {
      const prompt = buildSystemPrompt(feature);
      expect(prompt).toContain('AirQo Nexus AI Assistant');
      // Without context, the prompt uses the "currently viewing" format
      expect(prompt).toMatch(/currently viewing the .+ page/i);
    }
  });

  it('mentions the correct feature label for "analytics"', () => {
    const prompt = buildSystemPrompt('analytics');
    expect(prompt).toContain('Air Quality Analysis');
  });

  it('mentions the correct feature label for "map"', () => {
    const prompt = buildSystemPrompt('map');
    expect(prompt).toContain('Map');
  });

  it('mentions the correct feature label for "rankings"', () => {
    const prompt = buildSystemPrompt('rankings');
    expect(prompt).toContain('Rankings');
  });

  it('includes air quality context', () => {
    const prompt = buildSystemPrompt('general');
    expect(prompt).toContain('air quality');
    expect(prompt).toContain('AQI');
  });

  it('works without context (backward compatible)', () => {
    for (const feature of ALL_FEATURES) {
      const prompt = buildSystemPrompt(feature);
      expect(prompt).toContain('Your role:');
      expect(prompt).toContain('Formatting:');
    }
  });
});

describe('buildSystemPrompt with context', () => {
  it('includes pageTitle and pathname when context provides them', () => {
    const prompt = buildSystemPrompt('analytics', {
      pathname: '/air-quality/analytics',
      pageTitle: 'Air Quality Analysis',
      pageDescription: 'Compare and analyze air quality trends.',
    });
    expect(prompt).toContain('Air Quality Analysis');
    expect(prompt).toContain('/air-quality/analytics');
    expect(prompt).toContain('Compare and analyze air quality trends.');
    expect(prompt).toContain('analytics');
    expect(prompt).toContain('the air quality analytics page');
  });

  it('includes pageDescription in the prompt', () => {
    const prompt = buildSystemPrompt('map', {
      pathname: '/map',
      pageTitle: 'Air Quality Map',
      pageDescription: 'Live air quality across monitored locations.',
    });
    expect(prompt).toContain('Live air quality across monitored locations.');
  });

  it('mentions structured data when data is provided', () => {
    const prompt = buildSystemPrompt('analytics', {
      pathname: '/air-quality/analytics',
      pageTitle: 'Air Quality Analysis',
      pageDescription: 'Trend analysis.',
      data: { chartCount: 5, chartTitles: ['PM2.5', 'NO2'] },
    });
    expect(prompt).toContain('Structured page data is available for this page.');
  });

  it('does NOT mention structured data when data is absent', () => {
    const prompt = buildSystemPrompt('analytics', {
      pathname: '/air-quality/analytics',
      pageTitle: 'Air Quality Analysis',
      pageDescription: 'Trend analysis.',
    });
    expect(prompt).not.toContain('Structured page data');
  });

  it('falls back to the feature label when context has no pageTitle', () => {
    const prompt = buildSystemPrompt('home', {});
    expect(prompt).toMatch(/currently viewing the .+ page/i);
    expect(prompt).toContain('Home');
  });

  it('handles context with only pathname (no title/description)', () => {
    const prompt = buildSystemPrompt('data-export', {
      pathname: '/data-export',
    });
    // Without a pageTitle, falls back to the feature-only format
    expect(prompt).toMatch(/currently viewing the .+ page/i);
    expect(prompt).toContain('Data Export');
  });

  it('handles non-object context gracefully', () => {
    const prompt = buildSystemPrompt('rankings', 'not-an-object');
    expect(prompt).toMatch(/currently viewing the .+ page/i);
    expect(prompt).toContain('Rankings');
  });

  it('handles null context gracefully', () => {
    const prompt = buildSystemPrompt('profile', null);
    expect(prompt).toMatch(/currently viewing the .+ page/i);
  });

  it('handles undefined context gracefully', () => {
    const prompt = buildSystemPrompt('general', undefined);
    expect(prompt).toMatch(/currently viewing the .+ page/i);
  });
});

describe('FEATURE_SUGGESTED_PROMPTS', () => {
  it('has exactly 3 entries per feature', () => {
    for (const feature of ALL_FEATURES) {
      const prompts = FEATURE_SUGGESTED_PROMPTS[feature];
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBe(3);
    }
  });

  it('has non-empty strings for all prompts', () => {
    for (const feature of ALL_FEATURES) {
      for (const prompt of FEATURE_SUGGESTED_PROMPTS[feature]) {
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      }
    }
  });

  it('contains all 8 features', () => {
    const keys = Object.keys(FEATURE_SUGGESTED_PROMPTS) as AiFeatureId[];
    expect(keys.sort()).toEqual(ALL_FEATURES.sort());
  });
});
