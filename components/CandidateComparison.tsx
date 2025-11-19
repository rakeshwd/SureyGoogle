import React, { useMemo } from 'react';
import { Questionnaire, SurveyResult } from '../types';
import { XIcon } from './icons';

interface CandidateComparisonProps {
  results: SurveyResult[];
  questionnaire: Questionnaire;
  onClose: () => void;
}

// Replaced orange (#f97316) with teal (#14b8a6)
const COMPARISON_COLORS = ['#14b8a6', '#1d4ed8', '#f59e0b', '#dc2626', '#2563eb'];

const RadarChart: React.FC<{
    data: { userName: string; traitScores: Record<string, number> }[];
    traits: string[];
}> = ({ data, traits }) => {
    const size = 400;
    const center = size / 2;
    const radius = size * 0.4;
    const numLevels = 4;
    const angleSlice = (Math.PI * 2) / traits.length;

    const gridLevels = Array.from({ length: numLevels }, (_, i) => {
        const levelRadius = radius * ((i + 1) / numLevels);
        const points = traits.map((_, index) => {
            const angle = angleSlice * index - Math.PI / 2;
            const x = center + levelRadius * Math.cos(angle);
            const y = center + levelRadius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return <polygon key={i} points={points} className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />;
    });

    const axes = traits.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={x2} y2={y2} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />;
    });

    const labels = traits.map((trait, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelRadius = radius * 1.15;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        // FIX: Explicitly type `textAnchor` to satisfy the SVG text element's prop type.
        let textAnchor: "middle" | "end" | "start" = "middle";
        if (x < center - 10) textAnchor = "end";
        if (x > center + 10) textAnchor = "start";

        return <text key={i} x={x} y={y} textAnchor={textAnchor} className="text-xs fill-slate-600 dark:fill-slate-400 font-medium">{trait}</text>;
    });

    const dataPolygons = data.map((candidate, candidateIndex) => {
        const points = traits.map((trait, i) => {
            const score = candidate.traitScores[trait] || 0;
            const pointRadius = radius * (score / 100);
            const angle = angleSlice * i - Math.PI / 2;
            const x = center + pointRadius * Math.cos(angle);
            const y = center + pointRadius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');

        return <polygon key={candidate.userName} points={points} fill={COMPARISON_COLORS[candidateIndex % COMPARISON_COLORS.length]} fillOpacity="0.2" stroke={COMPARISON_COLORS[candidateIndex % COMPARISON_COLORS.length]} strokeWidth="2" />;
    });

    return <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">{gridLevels}{axes}{labels}{dataPolygons}</svg>;
};

const CandidateComparison: React.FC<CandidateComparisonProps> = ({ results, questionnaire, onClose }) => {
    const comparisonData = useMemo(() => {
        return results.map(result => {
            const scoresByTrait: Record<string, { totalScore: number; maxScore: number }> = {};
            questionnaire.questions.forEach(q => {
                if (!scoresByTrait[q.trait]) {
                    scoresByTrait[q.trait] = { totalScore: 0, maxScore: 0 };
                }
                const answer = result.answers.find(a => a.questionId === q.id);
                const questionMaxScore = Math.max(...q.options.map(o => o.score));
                if (answer) {
                    scoresByTrait[q.trait].totalScore += answer.score;
                }
                scoresByTrait[q.trait].maxScore += questionMaxScore;
            });

            const traitScores = Object.fromEntries(
                Object.entries(scoresByTrait).map(([trait, scores]) => [
                    trait,
                    scores.maxScore > 0 ? Math.round((scores.totalScore / scores.maxScore) * 100) : 0
                ])
            );

            return {
                userName: result.userName,
                traitScores,
            };
        });
    }, [results, questionnaire]);

    const traits = useMemo(() => {
        const allTraits = new Set<string>();
        questionnaire.questions.forEach(q => allTraits.add(q.trait));
        return Array.from(allTraits);
    }, [questionnaire]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Candidate Comparison: <span className="text-teal-500 dark:text-teal-400">{questionnaire.title}</span></h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full" title="Close comparison view">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 text-center">Trait Score Radar</h3>
                             <RadarChart data={comparisonData} traits={traits} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-2">Legend</h3>
                            {comparisonData.map((d, i) => (
                                <div key={d.userName} className="flex items-center">
                                    <span className="h-4 w-4 rounded-full mr-3" style={{ backgroundColor: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}></span>
                                    <span>{d.userName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8">
                         <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                         <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trait</th>
                                        {comparisonData.map(d => <th key={d.userName} className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{d.userName}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {traits.map(trait => (
                                        <tr key={trait}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{trait}</td>
                                            {comparisonData.map(d => (
                                                <td key={d.userName} className="px-4 py-2 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">{d.traitScores[trait] || 0}%</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                         </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-teal-500 border border-transparent rounded-md shadow-sm hover:bg-teal-600">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateComparison;