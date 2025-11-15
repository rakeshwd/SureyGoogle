import React, { useState, useMemo } from 'react';
import { SurveyResult, Questionnaire, CertificateTemplate } from '../types';
import { SearchIcon, XIcon } from './icons';
import SurveyCertificate from './SurveyCertificate';

interface CandidateSearchProps {
  results: SurveyResult[];
  questionnaires: Questionnaire[];
  certificateTemplate: CertificateTemplate;
  renderActions?: (result: SurveyResult) => React.ReactNode;
}

const CandidateSearch: React.FC<CandidateSearchProps> = ({ results, questionnaires, certificateTemplate, renderActions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState<SurveyResult | null>(null);

  const filteredResults = useMemo(() => {
    return results.filter(result =>
      result.userName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [results, searchTerm]);

  const handleViewCertificate = (result: SurveyResult) => {
    setViewingCertificate(result);
  };

  const handleCloseCertificate = () => {
    setViewingCertificate(null);
  };

  const correspondingQuestionnaire = viewingCertificate ? questionnaires.find(q => q.id === viewingCertificate.questionnaireId) : null;

  return (
    <>
      {viewingCertificate && correspondingQuestionnaire && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-xl relative w-full max-w-5xl">
            <button
              onClick={handleCloseCertificate}
              className="absolute -top-4 -right-4 bg-white dark:bg-slate-700 rounded-full p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 z-10 no-print"
              aria-label="Close certificate view"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[90vh]">
                <SurveyCertificate 
                    result={viewingCertificate} 
                    questionnaire={correspondingQuestionnaire} 
                    template={certificateTemplate} 
                />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by candidate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Questionnaire</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredResults.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{r.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{r.questionnaireTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.round((r.totalScore / r.maxScore) * 100)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={() => handleViewCertificate(r)}
                          className="text-orange-500 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                        >
                          View Certificate
                        </button>
                        {renderActions && renderActions(r)}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
                        No results found for "{searchTerm}".
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CandidateSearch;
