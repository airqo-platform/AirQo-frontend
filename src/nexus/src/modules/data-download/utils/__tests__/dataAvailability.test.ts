import {
  getDataAvailability,
  getPartialDataWarning,
} from '../dataAvailability';
import type { DataDownloadResponse } from '@/shared/types/api';

const asDownloadResponse = (response: unknown) =>
  response as DataDownloadResponse;

describe('getPartialDataWarning', () => {
  (['sites', 'countries', 'cities'] as const).forEach(activeTab => {
    it(`uses site_name for the ${activeTab} tab when IDs are absent`, () => {
      const response = ['site_name,pm2_5', 'Selected site,4.46'].join('\n');

      expect(
        getPartialDataWarning(
          response,
          activeTab,
          ['site-1', 'site-2'],
          ['Selected site', 'Missing site'],
          ['pm2_5']
        )
      ).toEqual({
        totalSelected: 2,
        withData: 1,
        missingNames: ['Missing site'],
      });
    });
  });

  it('uses device_name for the devices tab when IDs are absent', () => {
    const response = ['device_name,pm2_5', 'AQ-1,4.46'].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'devices',
        ['device-1', 'device-2'],
        ['AQ-1', 'AQ-2'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['AQ-2'],
    });
  });

  it('matches site rows by ID even when API and UI names differ', () => {
    const response = [
      'site_id,site_name,datetime',
      'site-1,Siavonga,2026-07-27T00:00:00Z',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['site-1'],
        ['Siavonga Monitoring Site']
      )
    ).toBeUndefined();
  });

  it('reports only selected IDs that are absent from a CSV response', () => {
    const response = [
      'site_id,site_name,datetime',
      'site-1,Siavonga,2026-07-27T00:00:00Z',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['site-1', 'site-2'],
        ['Siavonga', 'Kabwe']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['Kabwe'],
    });
  });

  it('handles JSON responses and device identifiers', () => {
    const response = {
      status: 'success',
      message: 'ok',
      data: [{ device_id: 'device-1', device_name: 'AQ-1' }],
    };

    expect(
      getPartialDataWarning(
        asDownloadResponse(response),
        'devices',
        ['device-1'],
        ['AQ-1']
      )
    ).toBeUndefined();
  });

  it('handles JSON encoded as a string', () => {
    const response = JSON.stringify({
      status: 'success',
      data: [{ site_id: 'site-1', site_name: 'Siavonga' }],
    });

    expect(
      getPartialDataWarning(response, 'sites', ['site-1'], ['Other label'])
    ).toBeUndefined();
  });

  it('treats an explicit empty success response as no data for every selection', () => {
    const response = {
      status: 'success',
      message: 'No data found for the specified criteria.',
      data: [],
      metadata: null,
    };

    expect(
      getPartialDataWarning(
        asDownloadResponse(response),
        'sites',
        ['site-1'],
        ['Kawempe Division'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 1,
      withData: 0,
      missingNames: ['Kawempe Division'],
    });
  });

  it('matches duplicate selected names by occurrence instead of collapsing them', () => {
    const response = [
      'site_name,pm2_5',
      'Kawempe Division,4.46',
      'Kawempe Division,5.12',
      'Kawempe Division,6.03',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['site-1', 'site-2'],
        ['Kawempe Division', 'Kawempe Division'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['Kawempe Division'],
    });
  });

  it('falls back to verified names when returned IDs are not selected IDs', () => {
    const response = [
      'site_id,site_name,pm2_5',
      'device-1,Selected site,4.46',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['site-1', 'site-2'],
        ['Selected site', 'Missing site'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['Missing site'],
    });
  });

  it('checks search_name and location_name before rejecting an ID mismatch', () => {
    const response = [
      'site_id,site_name,search_name,location_name,pm2_5',
      'backend-site-id,Backend label,Selected site,Selected site,4.46',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['selected-site-id', 'missing-site-id'],
        ['Selected site', 'Missing site'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['Missing site'],
    });
  });

  it('counts unique locations rather than measurement rows', () => {
    const response = [
      'site_name,pm2_5',
      'Lion Pride 1 - Serengeti 782,4.46',
      'Lion Pride 1 - Serengeti 782,5.12',
      'Lion Pride 1 - Serengeti 782,6.03',
    ].join('\n');

    expect(
      getDataAvailability(
        response,
        'sites',
        ['site-1', 'site-2', 'site-3'],
        [
          'Lion Pride 1 - Serengeti 782',
          'Kawempe Division',
          'Kanyama residential area',
        ],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 3,
      withData: 1,
      missingNames: ['Kawempe Division', 'Kanyama residential area'],
    });
  });

  it('does not invent a missing-location warning without identifiers', () => {
    const response = {
      status: 'success',
      data: [{ datetime: '2026-07-27T00:00:00Z', pm2_5: 4.46 }],
    };

    expect(
      getPartialDataWarning(
        asDownloadResponse(response),
        'sites',
        ['site-1', 'site-2'],
        ['Siavonga', 'Kabwe']
      )
    ).toBeUndefined();
  });

  it('matches country and city site selections by site ID', () => {
    const response = {
      status: 'success',
      data: [{ site_id: 'site-1', site_name: 'API name' }],
    };

    expect(
      getPartialDataWarning(
        asDownloadResponse(response),
        'countries',
        ['site-1'],
        ['UI name']
      )
    ).toBeUndefined();
  });

  it('does not count metadata-only rows as pollutant readings', () => {
    const response = [
      'site_name,datetime,pm2_5',
      'Site with data,2026-07-28 00:00:00Z,4.46',
      'Metadata only,2026-07-28 00:00:00Z,',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['site-1', 'site-2'],
        ['Site with data', 'Metadata only'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['Metadata only'],
    });
  });

  it('ignores response locations outside the current selection', () => {
    const response = [
      'site_name,datetime,pm2_5',
      'Selected site,2026-07-28 00:00:00Z,4.46',
      'Unverified site,2026-07-28 00:00:00Z,5.12',
    ].join('\n');

    expect(
      getPartialDataWarning(
        response,
        'sites',
        ['site-1', 'site-2'],
        ['Selected site', 'Another selected site'],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 2,
      withData: 1,
      missingNames: ['Another selected site'],
    });
  });

  it('matches API names with compact spacing and ignores an extra site', () => {
    const response = [
      'site_name,pm2_5',
      'Kanyamaresidentialarea,43.47',
      'Kanyamaresidentialarea,32.98',
      'ChungaDumpsite,36.16',
    ].join('\n');

    expect(
      getDataAvailability(
        response,
        'sites',
        ['site-1', 'site-2', 'site-3'],
        [
          'Fmbs University Of Yaounde 1 Melen Campus',
          'Lusaka',
          'Kanyama residential area',
        ],
        ['pm2_5']
      )
    ).toEqual({
      totalSelected: 3,
      withData: 1,
      missingNames: ['Fmbs University Of Yaounde 1 Melen Campus', 'Lusaka'],
    });
  });
});
