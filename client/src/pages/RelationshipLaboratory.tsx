import React, { useState, useEffect } from 'react';
import './RelationshipLaboratory.css';
import { MetricRadar } from '../components/relationship/MetricRadar';
import { ModuleContent } from '../components/relationship/ModuleContent';
import { ScenariosSimulator } from '../components/relationship/ScenariosSimulator';
import { useTranslation } from '../i18n';

// Type definitions matching the backend
interface NarrativeModule {
    id: string; title: string; icon: string; priority: number;
    summary: string; deepAnalysis: string; keyInsights: string[];
    recommendations: string[]; confidence: number; evidence: string[];
    limitations: string[]; actions: { step: number; action: string }[];
}
interface Scenario {
    id: string; title: string; probability: number;
    strengths: string[]; risks: string[]; whatToDo: string[]; description: string;
}
interface RelationshipReport {
    executiveSummary: { type: string; potential: string; risk: string; coreMemory: string };
    modules: NarrativeModule[];
    scenarios: Scenario[];
    contextCompatibility: { context: string; score: number }[];
    topOpportunities: string[];
    topRisks: string[];
    actionPlan90Days: { step: number; action: string }[];
}

interface RelationshipLaboratoryProps {
    metrics: any[];
    report: RelationshipReport;
    isScanning?: boolean;
}

export const RelationshipLaboratory: React.FC<RelationshipLaboratoryProps> = ({ metrics, report, isScanning }) => {
    const { language } = useTranslation();
    const isEs = language === 'es';
    
    const [activeView, setActiveView] = useState<string>('executive');

    if (isScanning) {
        return (
            <div className="rip-container">
                <div className="scanner-overlay animate-in fade-in duration-300">
                    <div className="pulse-ring"></div>
                    <p>{isEs ? 'Escaneando entidades relacionales...' : 'Scanning relational entities...'}</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="rip-container">
                <div className="error-view">
                    <h2>{isEs ? 'Error en la Sincronización' : 'Synchronization Error'}</h2>
                    <p>{isEs ? 'No se pudo generar el reporte.' : 'Could not generate report.'}</p>
                </div>
            </div>
        );
    }

    const activeModule = report.modules.find(m => m.id === activeView);

    return (
        <div className="rip-container dashboard-layout">
            <aside className="rip-sidebar">
                <div className="rip-title-wrapper">
                    <h1 className="rip-title">NAOS RIP</h1>
                    <span className="rip-badge">V4.1</span>
                </div>

                <div className="sidebar-radar">
                    <MetricRadar metrics={metrics} />
                </div>

                <nav className="sidebar-nav">
                    <button 
                        className={`nav-btn ${activeView === 'executive' ? 'active' : ''}`}
                        onClick={() => setActiveView('executive')}
                    >
                        {isEs ? 'Resumen Ejecutivo' : 'Executive Summary'}
                    </button>
                    
                    {report.modules.map(mod => (
                        <button 
                            key={mod.id}
                            className={`nav-btn ${activeView === mod.id ? 'active' : ''}`}
                            onClick={() => setActiveView(mod.id)}
                        >
                            {mod.title}
                        </button>
                    ))}

                    <button 
                        className={`nav-btn highlight ${activeView === 'scenarios' ? 'active' : ''}`}
                        onClick={() => setActiveView('scenarios')}
                    >
                        {isEs ? 'Espacio de Posibilidades' : 'Possibility Space'}
                    </button>
                </nav>
            </aside>

            <main className="rip-main">
                {activeView === 'executive' && (
                    <div className="executive-view animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2>{isEs ? 'Resumen Ejecutivo' : 'Executive Summary'}</h2>
                        <div className="executive-cards">
                            <div className="exec-card">
                                <h4>{isEs ? 'Arquetipo' : 'Archetype'}</h4>
                                <p>{report.executiveSummary.type}</p>
                            </div>
                            <div className="exec-card highlight">
                                <h4>{isEs ? 'Potencial Máximo' : 'Maximum Potential'}</h4>
                                <p>{report.executiveSummary.potential}</p>
                            </div>
                            <div className="exec-card warning">
                                <h4>{isEs ? 'Riesgo Principal' : 'Primary Risk'}</h4>
                                <p>{report.executiveSummary.risk}</p>
                            </div>
                            <div className="exec-card">
                                <h4>{isEs ? 'Memoria Central' : 'Core Memory'}</h4>
                                <p>{report.executiveSummary.coreMemory}</p>
                            </div>
                        </div>

                        <div className="context-compat-section">
                            <h3>{isEs ? 'Compatibilidad por Contexto' : 'Compatibility by Context'}</h3>
                            <div className="context-bars">
                                {report.contextCompatibility.map(ctx => (
                                    <div key={ctx.context} className="context-bar-wrapper">
                                        <div className="context-label">
                                            <span>{ctx.context}</span>
                                            <span>{ctx.score}%</span>
                                        </div>
                                        <div className="context-track">
                                            <div className="context-fill" style={{ width: `${ctx.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeModule && (
                    <ModuleContent module={activeModule} />
                )}

                {activeView === 'scenarios' && (
                    <ScenariosSimulator scenarios={report.scenarios} />
                )}
            </main>
        </div>
    );
};
