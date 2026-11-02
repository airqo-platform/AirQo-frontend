import { AFRICA_CLEAN_AIR_FORUM_URL, NAV_ITEMS } from '@/lib/navItems';

describe('NAV_ITEMS', () => {
  it('exposes the task-based primary navigation sections', () => {
    expect(Object.keys(NAV_ITEMS)).toEqual([
      'Products',
      'Solutions',
      'Developers',
      'Resources',
      'About AirQo',
    ]);
  });

  it('makes technical documentation discoverable from Resources', () => {
    expect(NAV_ITEMS.Resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Technical documentation',
          href: '/resources?tab=technical',
        }),
        expect.objectContaining({
          title: 'Research & publications',
          href: '/resources?tab=research',
        }),
        expect.objectContaining({
          title: 'Guides & manuals',
          href: '/resources?tab=guide,manual',
        }),
      ]),
    );
  });

  it('links Africa Clean Air Forum to its official annual forum page', () => {
    expect(NAV_ITEMS['About AirQo']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Africa Clean Air Forum',
          href: AFRICA_CLEAN_AIR_FORUM_URL,
          newTab: true,
        }),
      ]),
    );
  });

  it('does not duplicate destinations inside a navigation section', () => {
    Object.values(NAV_ITEMS).forEach((items) => {
      const hrefs = items.map((item) => item.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });
  });

  it('marks external destinations to open safely in a new tab', () => {
    Object.values(NAV_ITEMS)
      .flat()
      .filter((item) => item.href.startsWith('http'))
      .forEach((item) => expect(item.newTab).toBe(true));
  });
});
