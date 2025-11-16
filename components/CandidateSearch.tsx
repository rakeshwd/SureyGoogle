import React, { useState, useMemo, useRef, useEffect } from 'react';
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

  const certificateModalRef = useRef<HTMLDivElement>(null);
  const [certificateScale, setCertificateScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (viewingCertificate && certificateModalRef.current) {
        const container = certificateModalRef.current;
        const padding = 32;
        const containerWidth = container.offsetWidth - padding * 2;
        const contentWidth = 1024;
        
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" ref={certificateModalRef}>
            <div className="bg-transparent rounded-lg relative w-full h-full max-w-5xl max-h-full flex items-center justify-center">
              <button
                onClick={handleCloseCertificate}
                className="absolute top-0 right-0 m-2 bg-white dark:bg-slate-700 rounded-full p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 z-20 no-print"
                aria-label="Close certificate view"
              >
                <XIcon className="w-6 h-6" />
              </button>
               <div style={{ transform: `scale(${certificateScale})`, transformOrigin: 'center center', width: '1024px', height: '722px' }}>
                  <SurveyCertificate result={viewingCertificate} questionnaire={correspondingQuestionnaire} template={certificateTemplate} />
              </div>
            </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text" placeholder="Search by candidate name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:border-slate-600"
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredResults.map((result) => (
              <div key={result.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 dark:text-white">{result.userName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{result.questionnaireTitle}</p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Score: <span className="font-bold text-lg text-orange-500">{Math.round((result.totalScore / result.maxScore) * 100)}%</span></p>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <button onClick={() => handleViewCertificate(result)} className="text-sm font-medium text-orange-500 hover:text-orange-400">
                          View Certificate
                      </button>
                      {renderActions && renderActions(result)}
                  </div>
              </div>
            ))}
        </div>
        {filteredResults.length === 0 && (
            <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
                No results found for "{searchTerm}".
            </div>
        )}
      </div>
    </>
  );
};

export default CandidateSearch;
