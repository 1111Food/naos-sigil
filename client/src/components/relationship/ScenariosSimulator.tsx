import React, { useState } from 'react';
import './ScenariosSimulator.css';
import { useTranslation } from '../../i18n';

interface Scenario {
    id: string;
    title: string;
    probability: number;
    strengths: string[];
    risks: string[];
    whatToDo: string[];
    description: string;
}

interface ScenariosSimulatorProps {
    scenarios: Scenario[];
}

export const ScenariosSimulator: React.FC<ScenariosSimulatorProps> = ({ scenarios }) => {
    const { language } = useTranslation();
    const isEs = language === 'es';
    const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0]?.id || '');

    const activeScenario = scenarios.find(s => s.id === activeScenarioId);

    if (!scenarios || scenarios.length === 0) return null;

    return (
        <div className="scenarios-simulator animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="simulator-header">
                <h2>{isEs ? 'Simulador de Decisiones' : 'Decision Simulator'}</h2>
                <p>{isEs ? 'Elige un objetivo para la relación y observa cómo cambia la dinámica:' : 'Choose a relationship goal and observe how the dynamic changes:'}</p>
            </header>

            <div className="scenarios-tabs">
                {scenarios.map(scenario => (
                    <button
                        key={scenario.id}
                        className={`scenario-tab ${activeScenarioId === scenario.id ? 'active' : ''}`}
                        onClick={() => setActiveScenarioId(scenario.id)}
                    >
                        <span className="scenario-title">{scenario.title}</span>
                        <span className="scenario-prob">{scenario.probability}% {isEs ? 'Potencial' : 'Potential'}</span>
                    </button>
                ))}
            </div>

            {activeScenario && (
                <div className="scenario-content animate-in fade-in duration-300">
                    <div className="scenario-summary">
                        <p>{activeScenario.description}</p>
                    </div>

                    <div className="scenario-grid">
                        <div className="scenario-column strengths">
                            <h3>{isEs ? 'Fortalezas' : 'Strengths'}</h3>
                            <ul>
                                {activeScenario.strengths.map((str, i) => <li key={i}>{str}</li>)}
                            </ul>
                        </div>
                        <div className="scenario-column risks">
                            <h3>{isEs ? 'Riesgos' : 'Risks'}</h3>
                            <ul>
                                {activeScenario.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="scenario-action-plan">
                        <h3>{isEs ? '¿Qué hacer en este escenario?' : 'What to do in this scenario?'}</h3>
                        <ul>
                            {activeScenario.whatToDo.map((action, i) => <li key={i}>{action}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
