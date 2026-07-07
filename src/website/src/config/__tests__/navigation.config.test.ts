import navigationConfig from '@/config/navigation.config';

describe('navigationConfig', () => {
  describe('structure', () => {
    it('has mainNav array', () => {
      expect(navigationConfig.mainNav).toBeDefined();
      expect(Array.isArray(navigationConfig.mainNav)).toBe(true);
    });

    it('has footerNav object', () => {
      expect(navigationConfig.footerNav).toBeDefined();
      expect(typeof navigationConfig.footerNav).toBe('object');
    });

    it('footerNav has products section', () => {
      expect(navigationConfig.footerNav.products).toBeDefined();
      expect(Array.isArray(navigationConfig.footerNav.products)).toBe(true);
    });

    it('footerNav has solutions section', () => {
      expect(navigationConfig.footerNav.solutions).toBeDefined();
      expect(Array.isArray(navigationConfig.footerNav.solutions)).toBe(true);
    });

    it('footerNav has developers section', () => {
      expect(navigationConfig.footerNav.developers).toBeDefined();
      expect(Array.isArray(navigationConfig.footerNav.developers)).toBe(true);
    });

    it('footerNav has company section', () => {
      expect(navigationConfig.footerNav.company).toBeDefined();
      expect(Array.isArray(navigationConfig.footerNav.company)).toBe(true);
    });
  });

  describe('mainNav items', () => {
    it('has 6 main navigation items', () => {
      expect(navigationConfig.mainNav).toHaveLength(6);
    });

    it('all items have a label', () => {
      navigationConfig.mainNav.forEach((item) => {
        expect(item.label).toBeDefined();
        expect(typeof item.label).toBe('string');
        expect(item.label.length).toBeGreaterThan(0);
      });
    });

    it('all items have an href', () => {
      navigationConfig.mainNav.forEach((item) => {
        expect(item.href).toBeDefined();
        expect(typeof item.href).toBe('string');
        expect(item.href.length).toBeGreaterThan(0);
      });
    });

    it('no duplicate hrefs in mainNav', () => {
      const hrefs = navigationConfig.mainNav.map((item) => item.href);
      const uniqueHrefs = [...new Set(hrefs)];
      expect(hrefs.length).toBe(uniqueHrefs.length);
    });

    it('contains expected navigation items', () => {
      const labels = navigationConfig.mainNav.map((item) => item.label);
      expect(labels).toContain('Products');
      expect(labels).toContain('Solutions');
      expect(labels).toContain('Developers');
      expect(labels).toContain('About');
      expect(labels).toContain('Blogs');
      expect(labels).toContain('FAQs');
    });

    it('contains expected hrefs', () => {
      const hrefs = navigationConfig.mainNav.map((item) => item.href);
      expect(hrefs).toContain('/products');
      expect(hrefs).toContain('/solutions');
      expect(hrefs).toContain('/developers');
      expect(hrefs).toContain('/about');
      expect(hrefs).toContain('/blogs');
      expect(hrefs).toContain('/faqs');
    });
  });

  describe('footerNav items', () => {
    it('all footer items have a label', () => {
      const allSections = [
        ...navigationConfig.footerNav.products,
        ...navigationConfig.footerNav.solutions,
        ...navigationConfig.footerNav.developers,
        ...navigationConfig.footerNav.company,
      ];
      allSections.forEach((item) => {
        expect(item.label).toBeDefined();
        expect(typeof item.label).toBe('string');
        expect(item.label.length).toBeGreaterThan(0);
      });
    });

    it('all footer items have an href', () => {
      const allSections = [
        ...navigationConfig.footerNav.products,
        ...navigationConfig.footerNav.solutions,
        ...navigationConfig.footerNav.developers,
        ...navigationConfig.footerNav.company,
      ];
      allSections.forEach((item) => {
        expect(item.href).toBeDefined();
        expect(typeof item.href).toBe('string');
        expect(item.href.length).toBeGreaterThan(0);
      });
    });

    it('products footer has 5 items', () => {
      expect(navigationConfig.footerNav.products).toHaveLength(5);
    });

    it('solutions footer has 2 items', () => {
      expect(navigationConfig.footerNav.solutions).toHaveLength(2);
    });

    it('developers footer has 2 items', () => {
      expect(navigationConfig.footerNav.developers).toHaveLength(2);
    });

    it('company footer has 5 items', () => {
      expect(navigationConfig.footerNav.company).toHaveLength(5);
    });

    it('products footer contains expected items', () => {
      const labels = navigationConfig.footerNav.products.map(
        (item) => item.label,
      );
      expect(labels).toContain('Monitor');
      expect(labels).toContain('Analytics');
      expect(labels).toContain('Calibrate');
      expect(labels).toContain('Mobile');
      expect(labels).toContain('API');
    });

    it('company footer contains expected items', () => {
      const labels = navigationConfig.footerNav.company.map(
        (item) => item.label,
      );
      expect(labels).toContain('About');
      expect(labels).toContain('Careers');
      expect(labels).toContain('Press');
      expect(labels).toContain('Contact');
      expect(labels).toContain('Partners');
    });
  });

  describe('optional isExternal property', () => {
    it('mainNav items without isExternal default to undefined', () => {
      navigationConfig.mainNav.forEach((item) => {
        expect(
          item.isExternal === undefined || typeof item.isExternal === 'boolean',
        ).toBe(true);
      });
    });
  });
});
