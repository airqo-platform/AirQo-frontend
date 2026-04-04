/* eslint-disable simple-import-sort/imports */
import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';

import { networkCoverageService } from '@/services/apiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCountryId?: string;
  initialCountryName?: string;
  initialCountryIso2?: string;
  onSaved?: (response: any) => void;
}

const NetworkCoverageAddMonitorDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  initialCountryId,
  initialCountryName,
  initialCountryIso2,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(initialCountryName || '');
  const [iso2State, setIso2State] = useState(initialCountryIso2 || '');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [type, setType] = useState<'Reference' | 'LCS' | 'Inactive'>('LCS');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [network, setNetwork] = useState('');
  const [operator, setOperator] = useState('');
  const [equipment, setEquipment] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [pollutants, setPollutants] = useState('');
  const [viewDataUrl, setViewDataUrl] = useState('');
  const [publicData, setPublicData] = useState<'Yes' | 'No'>('No');
  const [site, setSite] = useState('');
  const [deployed, setDeployed] = useState('');
  const [calibrationLastDate, setCalibrationLastDate] = useState('');
  const [calibrationMethod, setCalibrationMethod] = useState('');
  const [uptime30d, setUptime30d] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [coLocation, setCoLocation] = useState('');
  const [coLocationNote, setCoLocationNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [transmission, setTransmission] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const mapMarkerRef = useRef<any | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // reset minimal fields but keep advanced collapsed
      setName('');
      setCity('');
      setCountry(initialCountryName || '');
      setIso2State(initialCountryIso2 || '');
      setLatitude('');
      setLongitude('');
      setType('LCS');
      setStatus('active');
      setNetwork('');
      setOperator('');
      setEquipment('');
      setManufacturer('');
      setPollutants('');
      setViewDataUrl('');
      setPublicData('No');
      setSite('');
      setDeployed('');
      setCalibrationLastDate('');
      setCalibrationMethod('');
      setUptime30d('');
      setOrganisation('');
      setCoLocation('');
      setCoLocationNote('');
      setResolution('');
      setTransmission('');
      setAdvancedOpen(false);
      setMapVisible(false);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialCountryName, initialCountryIso2]);

  // Initialize map when the picker is opened
  useEffect(() => {
    if (!mapVisible) return undefined;
    if (typeof window === 'undefined' || !(window as any).mapboxgl) {
      // Mapbox not available — keep picker closed and show nothing
      return undefined;
    }

    const mapboxgl = (window as any).mapboxgl;
    const map = new mapboxgl.Map({
      container: mapElRef.current as HTMLElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center:
        latitude &&
        longitude &&
        Number.isFinite(Number(latitude)) &&
        Number.isFinite(Number(longitude))
          ? [Number(longitude), Number(latitude)]
          : [15.751726790157534, 1.5627232057281049],
      zoom: latitude && longitude ? 8 : 2.9,
      preserveDrawingBuffer: true,
    });

    mapInstanceRef.current = map;

    const addOrMoveMarker = (lng: number, lat: number) => {
      try {
        if (!mapMarkerRef.current) {
          mapMarkerRef.current = new mapboxgl.Marker({ color: '#2563EB' })
            .setLngLat([lng, lat])
            .addTo(map);
        } else {
          mapMarkerRef.current.setLngLat([lng, lat]);
        }
      } catch {
        // ignore marker errors
      }
    };

    const onClick = (e: any) => {
      const lng = e.lngLat?.lng ?? (e.lng && e.lng.lng) ?? null;
      const lat = e.lngLat?.lat ?? (e.lng && e.lng.lat) ?? null;
      if (lng == null || lat == null) return;
      setLatitude(String(lat));
      setLongitude(String(lng));
      addOrMoveMarker(lng, lat);
    };

    map.on('click', onClick);

    // If a country ISO was provided, add the Mapbox country-boundaries source
    // and fit the map to the country's polygon bounds. Also set max bounds
    // so users are encouraged to pick coordinates within the country.
    if (initialCountryIso2) {
      try {
        map.on('load', () => {
          try {
            // Add vector source for country boundaries
            if (!map.getSource('add-dialog-country-boundaries')) {
              map.addSource('add-dialog-country-boundaries', {
                type: 'vector',
                url: 'mapbox://mapbox.country-boundaries-v1',
                promoteId: 'iso_3166_1',
              });
            }

            // Add a simple fill layer for the selected country
            if (!map.getLayer('add-dialog-country-fill')) {
              map.addLayer({
                id: 'add-dialog-country-fill',
                type: 'fill',
                source: 'add-dialog-country-boundaries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get', 'iso_3166_1'], initialCountryIso2],
                paint: { 'fill-color': '#E8ECF3', 'fill-opacity': 0.45 },
              });
            }

            if (!map.getLayer('add-dialog-country-outline')) {
              map.addLayer({
                id: 'add-dialog-country-outline',
                type: 'line',
                source: 'add-dialog-country-boundaries',
                'source-layer': 'country_boundaries',
                filter: ['==', ['get', 'iso_3166_1'], initialCountryIso2],
                paint: { 'line-color': '#145DFF', 'line-width': 2 },
              });
            }

            // Wait until tiles & layer rendered then compute bounds
            map.once('idle', () => {
              try {
                const features = map.queryRenderedFeatures({
                  layers: ['add-dialog-country-fill'],
                });
                if (features && features.length > 0) {
                  const bounds = new mapboxgl.LngLatBounds();

                  const extendFromCoords = (coords: any) => {
                    if (!coords) return;
                    if (
                      typeof coords[0] === 'number' &&
                      typeof coords[1] === 'number'
                    ) {
                      bounds.extend([coords[0], coords[1]]);
                      return;
                    }
                    for (const c of coords) {
                      extendFromCoords(c);
                    }
                  };

                  features.forEach((f: any) => {
                    extendFromCoords(f.geometry?.coordinates);
                  });

                  if (!bounds.isEmpty()) {
                    // Pad bounds a bit so markers near the edges are visible
                    const west = bounds.getWest();
                    const south = bounds.getSouth();
                    const east = bounds.getEast();
                    const north = bounds.getNorth();
                    const lngPad = Math.max((east - west) * 0.12, 0.15);
                    const latPad = Math.max((north - south) * 0.12, 0.15);

                    const padded = new mapboxgl.LngLatBounds(
                      [west - lngPad, south - latPad],
                      [east + lngPad, north + latPad],
                    );

                    try {
                      map.fitBounds(padded, {
                        padding: 20,
                        maxZoom: 8,
                        duration: 700,
                      });
                    } catch {}

                    try {
                      map.setMaxBounds(padded);
                    } catch {}
                  }
                }
              } catch {
                // ignore errors computing bounds
              }
            });
          } catch {
            // ignore source/layer errors
          }
        });
      } catch {
        // ignore
      }
    }

    // If initial coordinates exist, show marker
    if (latitude && longitude) {
      const latN = Number(latitude);
      const lonN = Number(longitude);
      if (Number.isFinite(latN) && Number.isFinite(lonN)) {
        addOrMoveMarker(lonN, latN);
        try {
          map.flyTo({ center: [lonN, latN], zoom: 8, duration: 400 });
        } catch {}
      }
    }

    return () => {
      try {
        map.off('click', onClick);
        map.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
      mapMarkerRef.current = null;
    };
  }, [mapVisible, initialCountryIso2, latitude, longitude]);

  // Keep marker in sync when lat/lon inputs change while map is visible
  useEffect(() => {
    if (!mapVisible) return;
    const map = mapInstanceRef.current;
    const marker = mapMarkerRef.current;
    const latN = Number(latitude);
    const lonN = Number(longitude);
    if (map && marker && Number.isFinite(latN) && Number.isFinite(lonN)) {
      try {
        marker.setLngLat([lonN, latN]);
        map.panTo([lonN, latN]);
      } catch {}
    }
  }, [latitude, longitude, mapVisible]);

  if (!isOpen) return null;

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!country.trim()) return 'Country is required';
    if (latitude.trim() === '' || longitude.trim() === '')
      return 'Coordinates are required';
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon))
      return 'Coordinates must be valid numbers';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        city: city.trim() || undefined,
        country: country.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        type,
        status,
      };

      if (initialCountryId) payload.countryId = initialCountryId;
      if (network.trim()) payload.network = network.trim();
      if (operator.trim()) payload.operator = operator.trim();
      if (equipment.trim()) payload.equipment = equipment.trim();
      if (manufacturer.trim()) payload.manufacturer = manufacturer.trim();
      if (site.trim()) payload.site = site.trim();
      if (deployed.trim()) payload.deployed = deployed.trim();
      if (calibrationLastDate.trim())
        payload.calibrationLastDate = calibrationLastDate.trim();
      if (calibrationMethod.trim())
        payload.calibrationMethod = calibrationMethod.trim();
      if (uptime30d.trim()) payload.uptime30d = uptime30d.trim();
      if (organisation.trim()) payload.organisation = organisation.trim();
      if (coLocation.trim()) payload.coLocation = coLocation.trim();
      if (coLocationNote.trim()) payload.coLocationNote = coLocationNote.trim();
      if (resolution.trim()) payload.resolution = resolution.trim();
      if (transmission.trim()) payload.transmission = transmission.trim();
      if (iso2State.trim()) payload.iso2 = iso2State.trim();
      if (pollutants.trim())
        payload.pollutants = pollutants
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      if (viewDataUrl.trim()) payload.viewDataUrl = viewDataUrl.trim();
      if (publicData) payload.publicData = publicData;

      const response =
        await networkCoverageService.upsertNetworkCoverageRegistry(payload);

      setSuccess('Monitor saved');
      if (onSaved) onSaved(response);
      // small delay to show success then close
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Failed to save monitor');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />

      <div className="relative z-60 w-[95vw] max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Add monitor to network</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <p className="mb-3 text-sm text-slate-600">
            Add a new external monitor to the public registry. Required fields
            are highlighted.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Name *
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                City
              </div>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Country *
              </div>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 text-xs font-semibold text-slate-500">
                  Latitude *
                </div>
                <input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 0.3123"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-semibold text-slate-500">
                  Longitude *
                </div>
                <input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 32.5811"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                />
              </label>
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMapVisible((p) => !p)}
                  className="text-xs text-slate-600 underline"
                  aria-pressed={mapVisible}
                >
                  {mapVisible
                    ? 'Hide map picker'
                    : 'Use map to pick coordinates'}
                </button>
              </div>

              {mapVisible && (
                <div className="mt-3 rounded-md border border-slate-200 relative">
                  <div
                    ref={mapElRef}
                    className="h-64 w-full rounded-md"
                    aria-hidden={!mapVisible}
                  />

                  <div className="absolute bottom-3 right-3 z-30 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          mapInstanceRef.current?.zoomIn({ duration: 300 });
                        } catch {
                          // ignore
                        }
                      }}
                      aria-label="Zoom in"
                      className="grid h-10 w-10 place-items-center bg-white text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          mapInstanceRef.current?.zoomOut({ duration: 300 });
                        } catch {
                          // ignore
                        }
                      }}
                      aria-label="Zoom out"
                      className="grid h-10 w-10 place-items-center border-t border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-2 px-2 pb-2 text-xs text-slate-500">
                    Click on the map to place a marker and set
                    latitude/longitude.
                  </p>
                </div>
              )}
            </div>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Type
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              >
                <option value="LCS">Low-Cost Sensor (LCS)</option>
                <option value="Reference">Reference</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="block sm:col-span-2">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Network
              </div>
              <input
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block sm:col-span-2">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Operator
              </div>
              <input
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Equipment
              </div>
              <input
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Manufacturer
              </div>
              <input
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block sm:col-span-2">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Pollutants (comma separated)
              </div>
              <input
                value={pollutants}
                onChange={(e) => setPollutants(e.target.value)}
                placeholder="PM2.5, PM10"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <label className="block sm:col-span-2">
              <div className="mb-1 text-xs font-semibold text-slate-500">
                View data URL
              </div>
              <input
                value={viewDataUrl}
                onChange={(e) => setViewDataUrl(e.target.value)}
                placeholder="https://"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => setAdvancedOpen((p) => !p)}
                className="text-xs text-slate-600 underline"
              >
                {advancedOpen ? 'Hide advanced' : 'Show advanced options'}
              </button>
            </div>
          </div>

          {advancedOpen && (
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Public Data
                  </div>
                  <select
                    value={publicData}
                    onChange={(e) => setPublicData(e.target.value as any)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Co-location
                  </div>
                  <input
                    value={coLocation}
                    onChange={(e) => setCoLocation(e.target.value)}
                    placeholder="Yes / Not available / Location details"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>
              </div>
            </div>
          )}

          {advancedOpen && (
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Site
                  </div>
                  <input
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Organisation
                  </div>
                  <input
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Deployed
                  </div>
                  <input
                    value={deployed}
                    onChange={(e) => setDeployed(e.target.value)}
                    placeholder="e.g. Dec 2020"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Uptime (30d)
                  </div>
                  <input
                    value={uptime30d}
                    onChange={(e) => setUptime30d(e.target.value)}
                    placeholder="e.g. 96%"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Calibration last date
                  </div>
                  <input
                    value={calibrationLastDate}
                    onChange={(e) => setCalibrationLastDate(e.target.value)}
                    placeholder="e.g. Sep 2025"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Calibration method
                  </div>
                  <input
                    value={calibrationMethod}
                    onChange={(e) => setCalibrationMethod(e.target.value)}
                    placeholder="e.g. Field co-location"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Co-location note
                  </div>
                  <input
                    value={coLocationNote}
                    onChange={(e) => setCoLocationNote(e.target.value)}
                    placeholder="Extra context about co-location"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Resolution
                  </div>
                  <input
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="e.g. Hourly"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    Transmission
                  </div>
                  <input
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    placeholder="e.g. GSM, Fiber"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    ISO2 (optional)
                  </div>
                  <input
                    value={iso2State}
                    onChange={(e) => setIso2State(e.target.value)}
                    placeholder="e.g. UG"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300"
                  />
                </label>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && (
            <p className="mt-3 text-sm text-emerald-700">{success}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {isSaving ? 'Saving…' : 'Save monitor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkCoverageAddMonitorDialog;
