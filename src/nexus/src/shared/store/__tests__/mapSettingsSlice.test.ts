import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  setMapStyle,
  setNodeType,
  setMapSettings,
} from '../mapSettingsSlice';
import type { MapSettings } from '../mapSettingsSlice';

const mapSettingsReducer = reducer as Reducer<MapSettings>;

const initialState: MapSettings = {
  mapStyle: 'mapbox://styles/mapbox/streets-v12',
  nodeType: 'emoji',
};

describe('mapSettingsSlice', () => {
  it('returns the initial state', () => {
    expect(mapSettingsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  describe('setMapStyle', () => {
    it('with valid URL', () => {
      const state = mapSettingsReducer(
        initialState,
        setMapStyle('mapbox://styles/mapbox/dark-v11')
      );
      expect(state.mapStyle).toBe('mapbox://styles/mapbox/dark-v11');
      expect(state.nodeType).toBe('emoji');
    });

    it('with empty string', () => {
      const state = mapSettingsReducer(initialState, setMapStyle(''));
      expect(state.mapStyle).toBe('');
      expect(state.nodeType).toBe('emoji');
    });
  });

  describe('setNodeType', () => {
    it('sets emoji', () => {
      const state = mapSettingsReducer(
        { ...initialState, nodeType: 'heatmap' },
        setNodeType('emoji')
      );
      expect(state.nodeType).toBe('emoji');
    });

    it('sets heatmap', () => {
      const state = mapSettingsReducer(initialState, setNodeType('heatmap'));
      expect(state.nodeType).toBe('heatmap');
      expect(state.mapStyle).toBe('mapbox://styles/mapbox/streets-v12');
    });

    it('sets node', () => {
      const state = mapSettingsReducer(initialState, setNodeType('node'));
      expect(state.nodeType).toBe('node');
    });

    it('sets number', () => {
      const state = mapSettingsReducer(initialState, setNodeType('number'));
      expect(state.nodeType).toBe('number');
    });
  });

  describe('setMapSettings', () => {
    it('updates both mapStyle and nodeType', () => {
      const newSettings: MapSettings = {
        mapStyle: 'mapbox://styles/mapbox/satellite-v9',
        nodeType: 'number',
      };
      const state = mapSettingsReducer(
        initialState,
        setMapSettings(newSettings)
      );
      expect(state.mapStyle).toBe('mapbox://styles/mapbox/satellite-v9');
      expect(state.nodeType).toBe('number');
    });
  });
});
