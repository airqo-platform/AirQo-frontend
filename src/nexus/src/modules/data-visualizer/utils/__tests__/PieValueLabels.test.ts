import { computePieLabelPositions } from '../PieValueLabels';

const geometry = { width: 600, height: 400, radius: 120 };

describe('computePieLabelPositions', () => {
  it('returns nothing when there is no data or no size', () => {
    expect(computePieLabelPositions([], geometry)).toEqual([]);
    expect(
      computePieLabelPositions([{ name: 'A', value: 1, color: '#000' }], {
        width: 0,
        height: 0,
        radius: 120,
      })
    ).toEqual([]);
    expect(
      computePieLabelPositions(
        [{ name: 'A', value: 0, color: '#000' }],
        geometry
      )
    ).toEqual([]);
  });

  it('places a full-circle slice on the far side of the sweep', () => {
    // One slice spanning 360° starts at 12 o'clock and sweeps clockwise, so its
    // mid-angle lands at 6 o'clock.
    const [only] = computePieLabelPositions(
      [{ name: 'Only', value: 10, color: '#00f' }],
      geometry
    );

    expect(only.x).toBeCloseTo(geometry.width / 2, 5);
    expect(only.y).toBeGreaterThan(geometry.height / 2);
  });

  it('splits a full circle into quadrants', () => {
    const positions = computePieLabelPositions(
      [
        { name: 'Q1', value: 25, color: '#1' },
        { name: 'Q2', value: 25, color: '#2' },
        { name: 'Q3', value: 25, color: '#3' },
        { name: 'Q4', value: 25, color: '#4' },
      ],
      geometry
    );

    expect(positions).toHaveLength(4);
    // 12 o'clock, then clockwise: right, bottom, left.
    expect(positions[0].y).toBeLessThan(geometry.height / 2);
    expect(positions[0].x).toBeGreaterThanOrEqual(geometry.width / 2);

    expect(positions[1].x).toBeGreaterThan(geometry.width / 2);
    expect(positions[1].y).toBeGreaterThanOrEqual(geometry.height / 2);

    expect(positions[2].y).toBeGreaterThan(geometry.height / 2);
    expect(positions[2].x).toBeLessThan(geometry.width / 2);

    expect(positions[3].x).toBeLessThan(geometry.width / 2);
  });

  it('keeps the text outside the pie radius and the connector on the edge', () => {
    const positions = computePieLabelPositions(
      [
        { name: 'A', value: 50, color: '#1' },
        { name: 'B', value: 50, color: '#2' },
      ],
      geometry
    );

    positions.forEach(position => {
      const textDistance = Math.hypot(
        position.x - geometry.width / 2,
        position.y - geometry.height / 2
      );
      const edgeDistance = Math.hypot(
        position.lineFromX - geometry.width / 2,
        position.lineFromY - geometry.height / 2
      );

      // Text sits beyond the pie, and the connector starts exactly on it.
      expect(textDistance).toBeGreaterThan(geometry.radius);
      expect(edgeDistance).toBeCloseTo(geometry.radius, 5);
    });
  });

  it('normalises by total value, so shares do not depend on units', () => {
    const small = computePieLabelPositions(
      [
        { name: 'A', value: 1, color: '#1' },
        { name: 'B', value: 1, color: '#2' },
      ],
      geometry
    );
    const large = computePieLabelPositions(
      [
        { name: 'A', value: 1_000_000, color: '#1' },
        { name: 'B', value: 1_000_000, color: '#2' },
      ],
      geometry
    );

    expect(large.map(p => [p.x, p.y])).toEqual(small.map(p => [p.x, p.y]));
  });

  it('ignores non-finite and negative values without breaking the layout', () => {
    const positions = computePieLabelPositions(
      [
        { name: 'A', value: Number.NaN, color: '#1' },
        { name: 'B', value: 10, color: '#2' },
        { name: 'C', value: -5, color: '#3' },
      ],
      geometry
    );

    expect(positions).toHaveLength(3);
    positions.forEach(position => {
      expect(Number.isFinite(position.x)).toBe(true);
      expect(Number.isFinite(position.y)).toBe(true);
    });
  });

  it('does not let a negative slice shrink the others’ angles', () => {
    // Recharts never draws a negative slice, so it must not consume any of the
    // circle either — otherwise every other label rotates.
    const withNegative = computePieLabelPositions(
      [
        { name: 'A', value: 10, color: '#1' },
        { name: 'B', value: -100, color: '#2' },
      ],
      geometry
    );
    const withoutNegative = computePieLabelPositions(
      [
        { name: 'A', value: 10, color: '#1' },
        { name: 'B', value: 0, color: '#2' },
      ],
      geometry
    );

    expect(withNegative[0].angle).toBeCloseTo(withoutNegative[0].angle, 5);
    expect(withNegative[0].x).toBeCloseTo(withoutNegative[0].x, 5);
  });

  it('centres on the plot area, not the wrapper, when a legend is shown', () => {
    // Recharts shortens the plot area for a bottom legend, so the pie centre
    // moves up by half the legend height. Labels must follow it.
    const legendHeight = 40;
    const plain = computePieLabelPositions(
      [{ name: 'Only', value: 10, color: '#00f' }],
      geometry
    );
    const withLegend = computePieLabelPositions(
      [{ name: 'Only', value: 10, color: '#00f' }],
      { ...geometry, legendHeight }
    );

    const offset = legendHeight / 2;
    expect(plain[0].y - withLegend[0].y).toBeCloseTo(offset, 5);
    // Horizontal position is unaffected by a bottom legend.
    expect(withLegend[0].x).toBeCloseTo(plain[0].x, 5);
  });
});
