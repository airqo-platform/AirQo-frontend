import React, { useEffect, useMemo, useState } from 'react';
import { formatNumber } from '@/modules/usage/utils/format';

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

export interface PieLabelPosition extends PieSlice {
  /** Label anchor, in px from the top-left of the chart wrapper. */
  x: number;
  y: number;
  /** Where the connector line meets the pie edge and the text. */
  lineFromX: number;
  lineFromY: number;
  lineToX: number;
  lineToY: number;
  /** Horizontal text alignment that keeps labels inside the chart box. */
  textAlign: 'left' | 'right';
  /** Degrees, for the connector's rotation. */
  angle: number;
}

export interface PieLabelGeometry {
  width: number;
  height: number;
  radius: number;
  /** Gap between the pie edge and the label text. */
  gap?: number;
  /** Length of the connector line between pie edge and text. */
  lineLength?: number;
  /**
   * Height Recharts reserves for a bottom legend. The pie is centred in the
   * PLOT AREA (chart height minus that reservation), so the overlay has to use
   * the same centre or its labels drift off their slices.
   */
  legendHeight?: number;
}

const RAD = Math.PI / 180;

/**
 * Positions outside value labels for a pie, matching the "start at 12 o'clock,
 * sweep clockwise" convention recharts uses.
 *
 * The labels are HTML rather than SVG text on purpose: chart exports rasterise
 * the DOM, and SVG `<text>` inside the chart does not survive that, so every
 * exported pie lost its values while HTML (title, subtitle, legend) came
 * through. Drawing the labels as HTML makes the export match the screen.
 */
/**
 * Recharts never draws a negative or non-finite slice, so they must not shift
 * the other slices' angles either. Sanitised once, for both the total and the
 * per-slice sweep.
 */
const toPositive = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : 0;

export const computePieLabelPositions = (
  slices: PieSlice[],
  {
    width,
    height,
    radius,
    gap = 22,
    lineLength = 14,
    legendHeight = 0,
  }: PieLabelGeometry
): PieLabelPosition[] => {
  const total = slices.reduce((sum, slice) => sum + toPositive(slice.value), 0);

  if (total <= 0 || width <= 0 || height <= 0) {
    return [];
  }

  const cx = width / 2;
  // Match Recharts: the pie is centred in the PLOT AREA, which a bottom legend
  // shortens by its own height. Using the wrapper centre would offset every
  // label downwards by half the legend.
  const cy = (height - legendHeight) / 2;
  const positions: PieLabelPosition[] = [];
  // Recharts draws a pie starting at 12 o'clock and sweeping clockwise. Screen
  // coordinates put y downwards, so 12 o'clock is -90° (0° = east, -90° =
  // north) and a clockwise sweep INcreases the angle: -90° (top) → 0° (right)
  // → 90° (bottom) → 180° (left).
  let cursor = -90;

  slices.forEach(slice => {
    const sweep = (toPositive(slice.value) / total) * 360;
    const mid = cursor + sweep / 2;
    const radians = mid * RAD;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const edgeX = cx + cos * radius;
    const edgeY = cy + sin * radius;
    const textX = cx + cos * (radius + gap + lineLength);
    const textY = cy + sin * (radius + gap + lineLength);

    positions.push({
      ...slice,
      x: textX,
      y: textY,
      lineFromX: edgeX,
      lineFromY: edgeY,
      lineToX: cx + cos * (radius + gap),
      lineToY: cy + sin * (radius + gap),
      textAlign: textX >= cx ? 'left' : 'right',
      angle: mid,
    });

    cursor += sweep;
  });

  return positions;
};

export interface PieValueLabelsProps {
  slices: PieSlice[];
  geometry: PieLabelGeometry;
}

/** HTML overlay drawing each slice's value label and its connector line. */
const PieValueLabels: React.FC<PieValueLabelsProps> = ({
  slices,
  geometry,
}) => {
  const positions = useMemo(
    () => computePieLabelPositions(slices, geometry),
    [slices, geometry]
  );

  if (positions.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden="true"
    >
      {positions.map((position, index) => (
        // Slice names can repeat (e.g. the same value under two sheets), so the
        // index keeps the key unique.
        <React.Fragment key={`${position.name}-${index}`}>
          <div
            className="absolute h-px origin-left"
            style={{
              left: position.lineFromX,
              top: position.lineFromY,
              width: Math.hypot(
                position.lineToX - position.lineFromX,
                position.lineToY - position.lineFromY
              ),
              backgroundColor: position.color,
              transform: `rotate(${position.angle}deg)`,
              opacity: 0.9,
            }}
          />
          <span
            className="absolute whitespace-nowrap text-xs font-medium"
            style={{
              left: position.x,
              top: position.y,
              color: position.color,
              transform: 'translateY(-50%)',
              textAlign: position.textAlign,
              ...(position.textAlign === 'right'
                ? { transform: 'translate(-100%, -50%)' }
                : {}),
            }}
          >
            {position.name}: {formatNumber(position.value)}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export interface MeasuredSize {
  width: number;
  height: number;
}

/** Tracks an element's rendered size so labels can be positioned in px. */
export const useElementSize = (
  ref: React.RefObject<HTMLElement | null>
): MeasuredSize => {
  const [size, setSize] = useState<MeasuredSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize(previous =>
        previous.width === rect.width && previous.height === rect.height
          ? previous
          : { width: rect.width, height: rect.height }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

/**
 * Measures the space Recharts reserves for a bottom legend.
 *
 * The legend is rendered inside the chart's own SVG, so it is read back from
 * the chart wrapper (Recharts' stable `recharts-legend-wrapper` class) rather
 * than hard-coded — a wrong constant here silently misplaces every label.
 */
export const useLegendHeight = (
  ref: React.RefObject<HTMLElement | null>,
  active: boolean
): number => {
  const [legendHeight, setLegendHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element || !active) {
      setLegendHeight(0);
      return;
    }

    const measure = () => {
      const legend = element.querySelector<SVGGElement>(
        '.recharts-legend-wrapper'
      );
      const next = legend ? legend.getBoundingClientRect().height : 0;
      setLegendHeight(previous => (previous === next ? previous : next));
    };

    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    observer?.observe(element);

    return () => observer?.disconnect();
  }, [ref, active]);

  return legendHeight;
};

export { PieValueLabels };
export default PieValueLabels;
