import React from 'react';
import { render, screen } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { loadPM25HeatMapData, loadMapEventsData } from 'redux/MapData/operations';
import MapContainer from './MapContainer';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

jest.mock('your-hooks', () => ({
    usePM25HeatMapData: jest.fn(() => ({ features: [] })),
    useEventsMapData: jest.fn(() => ({ features: [] })),
}));

describe('MapContainer', () => {
    it('dispatches actions on initial render if data is empty', () => {
        const mockDispatch = jest.fn();
        useDispatch.mockReturnValue(mockDispatch);

        render(<MapContainer />);
        expect(mockDispatch).toHaveBeenCalledWith(loadPM25HeatMapData());
        expect(mockDispatch).toHaveBeenCalledWith(
            loadMapEventsData({
                recent: 'yes',
                external: 'no',
                metadata: 'site_id',
                frequency: 'hourly',
                active: 'yes',
            })
        );
    });

    it('renders OverlayMap when heatMapData is available', () => {
        const mockDispatch = jest.fn();
        useDispatch.mockReturnValue(mockDispatch);
        jest.mock('your-hooks', () => ({
            usePM25HeatMapData: jest.fn(() => ({
                features: [{ "geometry": { "coordinates": [33.269948767666726, 0.3976606461111487], "type": "Point" }, "properties": { "interval": 26.61421875414251, "latitude": 0.3976606461111487, "longitude": 33.269948767666726, "pm2_5": 54.08361977962887, "variance": 184.38063304179272 }, "type": "Feature" }, { "geometry": { "coordinates": [33.22026394233339, 0.40645178522225933], "type": "Point" }, "properties": { "interval": 26.659677319838934, "latitude": 0.40645178522225933, "longitude": 33.22026394233339, "pm2_5": 55.434074134188336, "variance": 185.01103571374807 }, "type": "Feature" }],
            })),
            useEventsMapData: jest.fn(() => ({ features: [] })),
        }));

        render(<MapContainer />);
        expect(screen.getByTestId('overlay-map')).toBeInTheDocument();
    });

    it('renders CircularLoader when heatMapData is empty', () => {
        const mockDispatch = jest.fn();
        useDispatch.mockReturnValue(mockDispatch);
        jest.mock('your-hooks', () => ({
            usePM25HeatMapData: jest.fn(() => ({ features: [] })),
            useEventsMapData: jest.fn(() => ({ features: [] })),
        }));

        render(<MapContainer />);
        expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
});
