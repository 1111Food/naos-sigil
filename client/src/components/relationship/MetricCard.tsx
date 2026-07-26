import React from 'react';
import './MetricCard.css';

interface MetricProps {
    metric: {
        name: string;
        value: number;
        confidence: number;
        trend: number;
    }
}

export const MetricCard: React.FC<MetricProps> = ({ metric }) => {
    const isPositive = metric.trend >= 0;
    
    // Format camelCase name to spaced
    const displayName = metric.name.replace(/([A-Z])/g, ' $1').trim();

    return (
        <div className="metric-card">
            <div className="metric-header">
                <span className="metric-name">{displayName}</span>
                <span className="metric-confidence">{metric.confidence}% Conf.</span>
            </div>
            <div className="metric-body">
                <div className="metric-value-wrapper">
                    <span className="metric-value">{metric.value}</span>
                    <span className="metric-max">/100</span>
                </div>
                <div className={`metric-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(metric.trend)}
                </div>
            </div>
            <div className="metric-progress-bar">
                <div 
                    className="metric-progress-fill" 
                    style={{ width: `${metric.value}%`, background: `hsl(${metric.value * 1.2}, 70%, 50%)` }}
                />
            </div>
        </div>
    );
};
