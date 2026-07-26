import React from 'react';
import './ModuleContent.css';
import { useTranslation } from '../../i18n';

interface NarrativeModule {
    id: string;
    title: string;
    icon: string;
    priority: number;
    summary: string;
    deepAnalysis: string;
    keyInsights: string[];
    recommendations: string[];
    confidence: number;
    evidence: string[];
    limitations: string[];
    actions: { step: number; action: string }[];
}

interface ModuleContentProps {
    module: NarrativeModule;
}

export const ModuleContent: React.FC<ModuleContentProps> = ({ module }) => {
    const { language } = useTranslation();
    const isEs = language === 'es';

    return (
        <div className="module-content animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="module-header">
                <h2>{module.title}</h2>
                <div className="module-confidence">
                    {module.confidence}% {isEs ? 'Confianza' : 'Confidence'}
                </div>
            </header>

            <section className="module-section summary">
                <p>{module.summary}</p>
            </section>

            <section className="module-section deep-analysis">
                <h3>{isEs ? 'Análisis Profundo' : 'Deep Analysis'}</h3>
                <p>{module.deepAnalysis}</p>
            </section>

            <div className="module-grid">
                <section className="module-section">
                    <h3>{isEs ? 'Insights Clave' : 'Key Insights'}</h3>
                    <ul>
                        {module.keyInsights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                        ))}
                    </ul>
                </section>

                <section className="module-section">
                    <h3>{isEs ? 'Recomendaciones' : 'Recommendations'}</h3>
                    <ul>
                        {module.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="module-section evidence">
                <h3>{isEs ? 'Evidencia Matemática' : 'Mathematical Evidence'}</h3>
                <ul>
                    {module.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                    ))}
                </ul>
            </section>

            {module.actions && module.actions.length > 0 && (
                <section className="module-section actions">
                    <h3>{isEs ? 'Plan de Acción' : 'Action Plan'}</h3>
                    <div className="action-steps">
                        {module.actions.map((act, i) => (
                            <div key={i} className="action-step">
                                <div className="step-number">{act.step}</div>
                                <div className="step-text">{act.action}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
