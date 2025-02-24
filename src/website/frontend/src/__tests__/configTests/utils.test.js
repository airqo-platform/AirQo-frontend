import { stripTrailingSlash } from '../../../config/utils'

describe('stripTrailingSlash', () => {
    it('removes trailing slash from URLs', () => {
        const inputUrl = 'https://example.com/path/';
        const expectedUrl = 'https://example.com/path';

        const result = stripTrailingSlash(inputUrl);

        expect(result).toBe(expectedUrl);
    });

    it('returns the same URL if no trailing slash is present', () => {
        const inputUrl = 'https://example.com/path';
        const expectedUrl = 'https://example.com/path';

        const result = stripTrailingSlash(inputUrl);

        expect(result).toBe(expectedUrl);
    });

    it('returns undefined if input URL is undefined', () => {
        const inputUrl = undefined;

        const result = stripTrailingSlash(inputUrl);

        expect(result).toBeUndefined();
    });

    it('returns null if input URL is null', () => {
        const inputUrl = null;

        const result = stripTrailingSlash(inputUrl);

        expect(result).toBeNull();
    });
});
