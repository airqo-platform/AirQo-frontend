import { NextResponse } from 'next/server';

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: GitHubAsset[];
}

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/airqo-platform/AirQo-frontend/releases?per_page=20',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 502 });
    }

    const releases: GitHubRelease[] = await res.json();

    // Desktop releases are identified by having a .exe asset (v0.x.y series)
    const desktop = releases.find((r) => r.assets.some((a) => a.name.endsWith('.exe')));

    if (!desktop) {
      return NextResponse.json({ error: 'No desktop release found' }, { status: 404 });
    }

    const find = (match: (name: string) => boolean) =>
      desktop.assets.find((a) => match(a.name))?.browser_download_url ?? null;

    return NextResponse.json({
      version: desktop.tag_name,
      windows: {
        exe: find((n) => n.endsWith('.exe')),
      },
      mac: {
        arm64Dmg: find((n) => n.includes('arm64') && n.endsWith('.dmg')),
        arm64Zip: find((n) => n.includes('arm64') && n.endsWith('.zip')),
        intelDmg: find((n) => !n.includes('arm64') && n.endsWith('.dmg')),
        intelZip: find((n) => !n.includes('arm64') && n.endsWith('.zip')),
      },
      linux: {
        appImage: find((n) => n.endsWith('.AppImage')),
        deb: find((n) => n.endsWith('.deb')),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
