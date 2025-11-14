import React, { useState, useMemo } from 'react';
import { Questionnaire, SurveyResult, CertificateTemplate } from '../types';
import { LogoutIcon, BriefcaseIcon, ScaleIcon } from './icons';
import CandidateComparison from './CandidateComparison';
import CandidateSearch from './CandidateSearch';

interface RecruiterDashboardProps {
  questionnaires: Questionnaire[];
  results: SurveyResult[];
  onLogout: () => void;
  certificateTemplate: CertificateTemplate;
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


const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ questionnaires, results, onLogout, certificateTemplate }) => {
    const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('all');
    const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    
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

    const handleSelectResult = (resultId: string) => {
        setSelectedResultIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resultId)) {
                newSet.delete(resultId);
            } else {
                newSet.add(resultId);
            }
            return newSet;
        });
    };

    const { selectedResults, comparisonQuestionnaire, isComparisonValid } = useMemo(() => {
        const selected = results.filter(r => selectedResultIds.has(r.id));
        if (selected.length < 2) {
            return { selectedResults: selected, comparisonQuestionnaire: null, isComparisonValid: false };
        }
        const firstQuestionnaireId = selected[0].questionnaireId;
        const allSameQuestionnaire = selected.every(r => r.questionnaireId === firstQuestionnaireId);

        if (!allSameQuestionnaire) {
            return { selectedResults: selected, comparisonQuestionnaire: null, isComparisonValid: false };
        }
        
        const questionnaire = questionnaires.find(q => q.id === firstQuestionnaireId);
        return { selectedResults: selected, comparisonQuestionnaire: questionnaire || null, isComparisonValid: !!questionnaire };
    }, [selectedResultIds, results, questionnaires]);


    return (
        <div className="space-y-8">
            {isComparisonModalOpen && isComparisonValid && comparisonQuestionnaire && (
                <CandidateComparison
                    results={selectedResults}
                    questionnaire={comparisonQuestionnaire}
                    onClose={() => setIsComparisonModalOpen(false)}
                />
            )}

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

            {/* Candidate Search */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Candidate Search</h2>
              <CandidateSearch
                results={results}
                questionnaires={questionnaires}
                certificateTemplate={certificateTemplate}
              />
            </div>
            
             {/* All Candidate Results for Comparison */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold">All Candidate Results</h2>
                    <button
                        onClick={() => setIsComparisonModalOpen(true)}
                        disabled={!isComparisonValid}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        title={!isComparisonValid && selectedResults.length > 1 ? "Please select results from the same questionnaire." : undefined}
                    >
                        <ScaleIcon className="w-5 h-5 mr-2" />
                        Compare Selected ({selectedResultIds.size})
                    </button>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                Select
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Questionnaire</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Score</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Completed At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                          {results.map((r) => (
                            <tr key={r.id} className={selectedResultIds.has(r.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                 <input
                                    type="checkbox"
                                    checked={selectedResultIds.has(r.id)}
                                    onChange={() => handleSelectResult(r.id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:bg-slate-900 dark:border-slate-600"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{r.userName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{r.questionnaireTitle}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.round((r.totalScore / r.maxScore) * 100)}%</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                {new Date(r.completedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;