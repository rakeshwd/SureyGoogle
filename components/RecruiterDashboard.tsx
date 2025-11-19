
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Questionnaire, SurveyResult, CertificateTemplate } from '../types';
import { BriefcaseIcon, ScaleIcon, SearchIcon, XIcon, FilterIcon } from './icons';
import CandidateComparison from './CandidateComparison';
import SurveyCertificate from './SurveyCertificate';

const TraitAnalysisBar: React.FC<{ trait: string; averageScore: number }> = ({ trait, averageScore }) => {
    const percentage = Math.round(averageScore);
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-md font-medium text-slate-800 dark:text-slate-200">{trait}</span>
                <span className="text-md font-semibold text-orange-500 dark:text-orange-400">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-orange-500 h-2.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

// FIX: Defined the RecruiterDashboardProps interface.
interface RecruiterDashboardProps {
    questionnaires: Questionnaire[];
    results: SurveyResult[];
    certificateTemplate: CertificateTemplate;
}

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ questionnaires, results, certificateTemplate }) => {
    const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [viewingCertificate, setViewingCertificate] = useState<SurveyResult | null>(null);
    
    // Filters for Candidate Hub
    const [hubQuestionnaireFilter, setHubQuestionnaireFilter] = useState<string>('all');
    const [minScore, setMinScore] = useState<number | ''>('');
    const [maxScore, setMaxScore] = useState<number | ''>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    const certificateModalRef = useRef<HTMLDivElement>(null);
    const [certificateScale, setCertificateScale] = useState(1);

    useEffect(() => {
        const calculateScale = () => {
            if (viewingCertificate && certificateModalRef.current) {
                const container = certificateModalRef.current;
                // Subtract padding from the container width
                const padding = 32; // Corresponds to p-4, assuming 1rem = 16px
                const containerWidth = container.offsetWidth - padding * 2;
                const contentWidth = 1024; // Certificate's native width
                
                if (containerWidth < contentWidth) {
                    setCertificateScale(containerWidth / contentWidth);
                } else {
                    setCertificateScale(1);
                }
            }
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [viewingCertificate]);


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
                if (!traitStats[trait]) traitStats[trait] = { totalScore: 0, maxScore: 0 };
                traitStats[trait].totalScore += answer.score;
                traitStats[trait].maxScore += Math.max(...question.options.map(o => o.score));
            }
        }
        return Object.entries(traitStats).map(([trait, data]) => ({
            trait,
            averageScore: data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0
        })).sort((a, b) => b.averageScore - a.averageScore);
    }, [selectedQuestionnaireId, results, questionnaires]);

    const filteredResults = useMemo(() => {
        return results.filter(result => {
            const matchesSearch = result.userName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesQuestionnaire = hubQuestionnaireFilter === 'all' || result.questionnaireId === hubQuestionnaireFilter;

            const percentage = Math.round((result.totalScore / result.maxScore) * 100);
            const matchesMinScore = minScore === '' || percentage >= minScore;
            const matchesMaxScore = maxScore === '' || percentage <= maxScore;

            const resultDate = new Date(result.completedAt);
            let matchesStartDate = true;
            if (startDate) {
                const start = new Date(startDate);
                // Start of the selected day
                start.setHours(0, 0, 0, 0);
                matchesStartDate = resultDate >= start;
            }
            
            let matchesEndDate = true;
            if (endDate) {
                const end = new Date(endDate);
                // End of the selected day
                end.setHours(23, 59, 59, 999); 
                matchesEndDate = resultDate <= end;
            }

            return matchesSearch && matchesQuestionnaire && matchesMinScore && matchesMaxScore && matchesStartDate && matchesEndDate;
        }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [results, searchTerm, hubQuestionnaireFilter, minScore, maxScore, startDate, endDate]);

    const handleSelectResult = (resultId: string) => {
        setSelectedResultIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resultId)) newSet.delete(resultId);
            else newSet.add(resultId);
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

    const correspondingQuestionnaire = viewingCertificate ? questionnaires.find(q => q.id === viewingCertificate.questionnaireId) : null;

    return (
        <div className="space-y-8">
            {isComparisonModalOpen && isComparisonValid && comparisonQuestionnaire && (
                <CandidateComparison results={selectedResults} questionnaire={comparisonQuestionnaire} onClose={() => setIsComparisonModalOpen(false)} />
            )}

            {viewingCertificate && correspondingQuestionnaire && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" ref={certificateModalRef}>
                    <div className="bg-transparent rounded-lg relative w-full h-full max-w-3xl max-h-full flex items-center justify-center">
                        <button
                            onClick={() => setViewingCertificate(null)}
                            className="absolute top-0 right-0 m-2 bg-white dark:bg-slate-700 rounded-full p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 z-20 no-print"
                            aria-label="Close certificate view"
                            title="Close certificate view"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                         <div style={{ transform: `scale(${certificateScale})`, transformOrigin: 'center center', width: '1024px', height: '722px' }}>
                            <SurveyCertificate 
                                result={viewingCertificate} 
                                questionnaire={correspondingQuestionnaire} 
                                template={certificateTemplate} 
                                showActions={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                    <BriefcaseIcon className="w-8 h-8 mr-3 text-orange-500 dark:text-orange-400"/>
                    Recruiter Dashboard
                </h2>
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value="all">All Questionnaires</option>
                            {questionnaires.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                        </select>
                    </div>
                </div>
                {traitAnalysis.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {traitAnalysis.map(({ trait, averageScore }) => <TraitAnalysisBar key={trait} trait={trait} averageScore={averageScore} />)}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"><p className="text-slate-500 dark:text-slate-400">No survey results available for this selection.</p></div>
                )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold">Candidate Hub</h3>
                    <button
                        onClick={() => setIsComparisonModalOpen(true)}
                        disabled={!isComparisonValid}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed"
                        title={!isComparisonValid && selectedResults.length > 1 ? "Please select results from the same questionnaire." : "Compare scores of selected candidates side-by-side"}
                    >
                        <ScaleIcon className="w-5 h-5 mr-2" />
                        Compare Selected ({selectedResultIds.size})
                    </button>
                </div>
                
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text" placeholder="Search by candidate name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600"
                            aria-label="Search candidates"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium ${showFilters ? 'bg-orange-50 text-orange-700 border-orange-500 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-200'} hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors`}
                    >
                        <FilterIcon className="h-5 w-5 mr-2" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
                        {/* Questionnaire Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Questionnaire</label>
                            <select
                                value={hubQuestionnaireFilter}
                                onChange={(e) => setHubQuestionnaireFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                aria-label="Filter by questionnaire"
                            >
                                <option value="all">All Questionnaires</option>
                                {questionnaires.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                            </select>
                        </div>

                        {/* Score Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Score Range (%)</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Min"
                                    value={minScore}
                                    onChange={(e) => setMinScore(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                    aria-label="Minimum score"
                                />
                                <span className="text-slate-500">-</span>
                                 <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Max"
                                    value={maxScore}
                                    onChange={(e) => setMaxScore(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                    aria-label="Maximum score"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Completion Date</label>
                             <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                    aria-label="Start date"
                                />
                                <span className="text-slate-500">-</span>
                                 <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                    aria-label="End date"
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResults.map(result => (
                        <div key={result.id} className={`rounded-lg p-4 transition-all duration-200 cursor-pointer ${selectedResultIds.has(result.id) ? 'bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500' : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-grow" onClick={() => setViewingCertificate(result)}>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{result.userName}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{result.questionnaireTitle}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedResultIds.has(result.id)}
                                    onChange={() => handleSelectResult(result.id)}
                                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded dark:bg-slate-900 dark:border-slate-600 ml-2"
                                    aria-label={`Select candidate ${result.userName}`}
                                />
                            </div>
                             <div className="mt-4" onClick={() => setViewingCertificate(result)}>
                                 <p className="text-sm text-slate-600 dark:text-slate-300">Score: <span className="font-bold text-xl text-orange-500">{Math.round((result.totalScore / result.maxScore) * 100)}%</span></p>
                                 <p className="text-xs text-slate-400 mt-1">Completed: {new Date(result.completedAt).toLocaleDateString()}</p>
                             </div>
                        </div>
                    ))}
                </div>
                {filteredResults.length === 0 && (
                    <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">No results found for "{searchTerm}".</div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;
