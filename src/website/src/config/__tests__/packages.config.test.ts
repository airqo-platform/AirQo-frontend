import {
  getAllPackages,
  getPackageById,
  packagesData,
} from '../packages.config';

describe('packages.config', () => {
  describe('packagesData', () => {
    it('is an array', () => {
      expect(Array.isArray(packagesData)).toBe(true);
    });

    it('contains at least one package', () => {
      expect(packagesData.length).toBeGreaterThan(0);
    });

    it('each package has all required fields', () => {
      packagesData.forEach((pkg) => {
        expect(typeof pkg.id).toBe('string');
        expect(pkg.id.length).toBeGreaterThan(0);
        expect(typeof pkg.name).toBe('string');
        expect(typeof pkg.displayName).toBe('string');
        expect(typeof pkg.description).toBe('string');
        expect(['library', 'cli']).toContain(pkg.type);
        expect(typeof pkg.version).toBe('string');
        expect(typeof pkg.weeklyDownloads).toBe('string');
        expect(typeof pkg.totalDownloads).toBe('string');
        expect(typeof pkg.installCommand).toBe('string');
        expect(typeof pkg.usageExample).toBe('string');
        expect(typeof pkg.homepage).toBe('string');
        expect(typeof pkg.npmPackage).toBe('string');
        expect(typeof pkg.docsUrl).toBe('string');
        expect(typeof pkg.license).toBe('string');
        expect(typeof pkg.lastPublished).toBe('string');
      });
    });

    it('supports framework packages and standalone CLI packages', () => {
      packagesData.forEach((pkg) => {
        expect(Array.isArray(pkg.frameworks ?? [])).toBe(true);
        if (pkg.type === 'library') {
          expect(pkg.frameworks?.length).toBeGreaterThan(0);
        }
      });
    });

    it('each package has a non-empty features array', () => {
      packagesData.forEach((pkg) => {
        expect(Array.isArray(pkg.features)).toBe(true);
        expect(pkg.features.length).toBeGreaterThan(0);
      });
    });

    it('each framework has required fields', () => {
      packagesData.forEach((pkg) => {
        (pkg.frameworks ?? []).forEach((fw) => {
          expect(['React', 'Vue', 'Flutter']).toContain(fw.name);
          expect(typeof fw.package).toBe('string');
          expect(typeof fw.displayName).toBe('string');
          expect(typeof fw.icon).toBe('string');
          expect(typeof fw.installCommand).toBe('string');
        });
      });
    });

    it('all URLs are valid strings', () => {
      packagesData.forEach((pkg) => {
        if (pkg.repository) {
          expect(pkg.repository).toMatch(/^https?:\/\//);
        }
        expect(pkg.homepage).toMatch(/^https?:\/\//);
        expect(pkg.npmPackage).toMatch(/^https?:\/\//);
        expect(pkg.docsUrl).toMatch(/^https?:\/\//);
      });
    });

    it('has unique ids', () => {
      const ids = packagesData.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getPackageById', () => {
    it('returns the package when found', () => {
      const pkg = getPackageById('icons');
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe('icons');
      expect(pkg?.name).toBe('icons');
    });

    it('includes the Vertex app scaffolding CLI', () => {
      const pkg = getPackageById('create-vertex-app');

      expect(pkg?.name).toBe('@airqo/create-vertex-app');
      expect(pkg?.type).toBe('cli');
      expect(pkg?.version).toBe('0.1.4');
      expect(pkg?.installCommand).toContain(
        'npx @airqo/create-vertex-app@latest',
      );
    });

    it('returns undefined when not found', () => {
      const pkg = getPackageById('nonexistent');
      expect(pkg).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const pkg = getPackageById('');
      expect(pkg).toBeUndefined();
    });
  });

  describe('getAllPackages', () => {
    it('returns the full packagesData array', () => {
      const all = getAllPackages();
      expect(all).toBe(packagesData);
      expect(all.length).toBe(packagesData.length);
    });
  });
});
