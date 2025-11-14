import React, { useState, useMemo } from 'react';
import { Questionnaire, SurveyResult } from '../types';
import { LogoutIcon, BriefcaseIcon } from './icons';

interface RecruiterDashboardProps {
  questionnaires: Questionnaire[];
  results: SurveyResult[];
  onLogout: () => void;
}

const TraitAnalysisBar: React.FC<{ trait: string; averageScore: number }> = ({ trait, averageScore }) => {
    const percentage = Math.round(averageScore);
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-md font-medium text-slate-800 dark:text-slate-200">{trait}</span>
                <span className="text-md font-semibold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};


const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ questionnaires, results, onLogout }) => {
    const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('all');
    
    const traitAnalysis = useMemo(() => {
        const relevantResults = selectedQuestionnaireId === 'all' 
            ? results 
            : results.filter(r => r.questionnaireId === selectedQuestionnaireId);

        if (relevantResults.length === 0) return [];

        const traitStats: Record<string, { totalScore: number; maxScore: number }> = {};

        for (const result of relevantResults) {
            const questionnaire = questionnaires.find(q => q.id === result.questionnaireId);
            if (!questionnaire) continue;

            for (const answer of result.answers) {
                const question = questionnaire.questions.find(q => q.id === answer.questionId);
                if (!question) continue;

                const trait = question.trait;
                if (!traitStats[trait]) {
                    traitStats[trait] = { totalScore: 0, maxScore: 0 };
                }

                traitStats[trait].totalScore += answer.score;
                traitStats[trait].maxScore += Math.max(...question.options.map(o => o.score));
            }
        }
        
        return Object.entries(traitStats).map(([trait, data]) => ({
            trait,
            averageScore: data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0
        })).sort((a, b) => b.averageScore - a.averageScore);

    }, [selectedQuestionnaireId, results, questionnaires]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                    <BriefcaseIcon className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400"/>
                    Recruiter Dashboard
                </h2>
                <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
                    <LogoutIcon className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold">Candidate Trait Analysis</h3>
                    <div className="w-full sm:w-64">
                        <label htmlFor="questionnaire-filter" className="sr-only">Filter by questionnaire</label>
                        <select
                            id="questionnaire-filter"
                            value={selectedQuestionnaireId}
                            onChange={(e) => setSelectedQuestionnaireId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value="all">All Questionnaires</option>
                            {questionnaires.map(q => (
                                <option key={q.id} value={q.id}>{q.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {traitAnalysis.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {traitAnalysis.map(({ trait, averageScore }) => (
                            <TraitAnalysisBar key={trait} trait={trait} averageScore={averageScore} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400">No survey results available for this selection.</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Complete some surveys to see the analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;