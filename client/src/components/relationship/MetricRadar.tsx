import React from 'react';
import './MetricRadar.css';

interface MetricRadarProps {
    metrics: {
        name: string;
        value: number;
    }[];
}

export const MetricRadar: React.FC<MetricRadarProps> = ({ metrics }) => {
    // If fewer than 3 metrics, we can't draw a polygon. Fallback gracefully.
    if (metrics.length < 3) {
        return <div className="radar-fallback">Insufficient metrics for dynamic mapping</div>;
    }

    const size = 300;
    const center = size / 2;
    const radius = (size / 2) - 40; // padding

    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const points = metrics.map((m, i) => getCoordinates(m.value, i, metrics.length));
    const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

    const maxPoints = metrics.map((_, i) => getCoordinates(100, i, metrics.length));
    const maxPointsString = maxPoints.map(p => `${p.x},${p.y}`).join(' ');

    // Generate concentric grid lines
    const gridLines = [20, 40, 60, 80, 100].map(level => {
        const pts = metrics.map((_, i) => getCoordinates(level, i, metrics.length));
        return pts.map(p => `${p.x},${p.y}`).join(' ');
    });

    return (
        <div className="metric-radar-container">
            <svg width={size} height={size} className="radar-svg">
                {/* Background Grid */}
                {gridLines.map((pts, i) => (
                    <polygon key={`grid-${i}`} points={pts} className="radar-grid-polygon" />
                ))}

                {/* Axis Lines */}
                {maxPoints.map((p, i) => (
                    <line key={`axis-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} className="radar-axis" />
                ))}

                {/* Data Polygon */}
                <polygon points={pointsString} className="radar-data-polygon" />

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle key={`pt-${i}`} cx={p.x} cy={p.y} r={4} className="radar-point" />
                ))}

                {/* Labels */}
                {metrics.map((m, i) => {
                    // Position text slightly outside the max radius
                    const labelPos = getCoordinates(115, i, metrics.length);
                    const displayName = m.name.replace(/([A-Z])/g, ' $1').trim();
                    return (
                        <text 
                            key={`label-${i}`} 
                            x={labelPos.x} 
                            y={labelPos.y} 
                            className="radar-label"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {displayName}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
