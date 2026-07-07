import routesConfig from '@/config/routes.config';

describe('routesConfig', () => {
  describe('structure', () => {
    it('has a home route', () => {
      expect(routesConfig.home).toBeDefined();
    });

    it('has a products section', () => {
      expect(routesConfig.products).toBeDefined();
    });

    it('has a solutions section', () => {
      expect(routesConfig.solutions).toBeDefined();
    });

    it('has a developers section', () => {
      expect(routesConfig.developers).toBeDefined();
    });

    it('has a company section', () => {
      expect(routesConfig.company).toBeDefined();
    });

    it('has a legal section', () => {
      expect(routesConfig.legal).toBeDefined();
    });

    it('has a blogs section', () => {
      expect(routesConfig.blogs).toBeDefined();
    });

    it('has a faqs route', () => {
      expect(routesConfig.faqs).toBeDefined();
    });
  });

  describe('product routes', () => {
    it('has index, monitor, analytics, calibrate, mobile, api', () => {
      expect(routesConfig.products.index).toBeDefined();
      expect(routesConfig.products.monitor).toBeDefined();
      expect(routesConfig.products.analytics).toBeDefined();
      expect(routesConfig.products.calibrate).toBeDefined();
      expect(routesConfig.products.mobile).toBeDefined();
      expect(routesConfig.products.api).toBeDefined();
    });
  });

  describe('solution routes', () => {
    it('has index, communities, african-cities', () => {
      expect(routesConfig.solutions.index).toBeDefined();
      expect(routesConfig.solutions.communities).toBeDefined();
      expect(routesConfig.solutions['african-cities']).toBeDefined();
    });
  });

  describe('developer routes', () => {
    it('has index, packages, airqo-devcon', () => {
      expect(routesConfig.developers.index).toBeDefined();
      expect(routesConfig.developers.packages).toBeDefined();
      expect(routesConfig.developers['airqo-devcon']).toBeDefined();
    });
  });

  describe('company routes', () => {
    it('has about, careers, press, contact, partners', () => {
      expect(routesConfig.company.about).toBeDefined();
      expect(routesConfig.company.careers).toBeDefined();
      expect(routesConfig.company.press).toBeDefined();
      expect(routesConfig.company.contact).toBeDefined();
      expect(routesConfig.company.partners).toBeDefined();
    });
  });

  describe('legal routes', () => {
    it('has terms and privacy', () => {
      expect(routesConfig.legal.terms).toBeDefined();
      expect(routesConfig.legal.privacy).toBeDefined();
    });
  });

  describe('blog routes', () => {
    it('has index', () => {
      expect(routesConfig.blogs.index).toBeDefined();
    });
  });

  describe('route format validation', () => {
    function collectRoutes(
      config: any,
      prefix = '',
    ): { path: string; label: string }[] {
      const routes: { path: string; label: string }[] = [];
      for (const key of Object.keys(config)) {
        const value = config[key];
        if (
          typeof value === 'object' &&
          value !== null &&
          'path' in value &&
          'label' in value
        ) {
          routes.push({ path: value.path, label: value.label });
        } else if (typeof value === 'object' && value !== null) {
          routes.push(...collectRoutes(value, `${prefix}${key}.`));
        }
      }
      return routes;
    }

    it('all routes have a path property', () => {
      const routes = collectRoutes(routesConfig);
      routes.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(typeof route.path).toBe('string');
      });
    });

    it('all routes have a label property', () => {
      const routes = collectRoutes(routesConfig);
      routes.forEach((route) => {
        expect(route.label).toBeDefined();
        expect(typeof route.label).toBe('string');
      });
    });

    it('all paths start with /', () => {
      const routes = collectRoutes(routesConfig);
      routes.forEach((route) => {
        expect(route.path.startsWith('/')).toBe(true);
      });
    });

    it('no duplicate paths exist', () => {
      const routes = collectRoutes(routesConfig);
      const paths = routes.map((r) => r.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('has expected path values for key routes', () => {
      expect(routesConfig.home.path).toBe('/home');
      expect(routesConfig.products.index.path).toBe('/products');
      expect(routesConfig.products.monitor.path).toBe('/products/monitor');
      expect(routesConfig.solutions.index.path).toBe('/solutions');
      expect(routesConfig.developers.index.path).toBe('/developers');
      expect(routesConfig.company.about.path).toBe('/about');
      expect(routesConfig.legal.terms.path).toBe('/legal/terms');
      expect(routesConfig.blogs.index.path).toBe('/blogs');
      expect(routesConfig.faqs.path).toBe('/faqs');
    });
  });
});
