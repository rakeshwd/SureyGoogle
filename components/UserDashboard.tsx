import React, { useState } from 'react';
import { Questionnaire, SurveyResult, User, CertificateTemplate } from '../types';
import UserSurvey from './UserSurvey';
import SurveyCertificate from './SurveyCertificate';
import { BriefcaseIcon, CheckCircleIcon } from './icons';

interface UserDashboardProps {
  currentUser: User;
  questionnaires: Questionnaire[];
  results: SurveyResult[];
  onSurveyComplete: (result: SurveyResult) => void;
  onShowNotification: (message: string) => void;
  certificateTemplate: CertificateTemplate;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, questionnaires, results, onSurveyComplete, onShowNotification, certificateTemplate }) => {
  const [activeSurvey, setActiveSurvey] = useState<Questionnaire | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<SurveyResult | null>(null);

  const handleStartSurvey = (questionnaire: Questionnaire) => {
    const shuffledQuestionnaire = {
      ...questionnaire,
      questions: shuffleArray(questionnaire.questions),
    };
    setActiveSurvey(shuffledQuestionnaire);
  };

  const handleSurveyCompletion = (result: SurveyResult) => {
    onSurveyComplete(result);
    setActiveSurvey(null);
    setViewingCertificate(result);
    onShowNotification(`Your results for "${result.questionnaireTitle}" are ready! A notification has been sent to your email.`);
  };

  const handleCloseCertificate = () => {
    setViewingCertificate(null);
  };

  if (activeSurvey) {
    return <UserSurvey questionnaire={activeSurvey} onComplete={handleSurveyCompletion} currentUser={currentUser} />;
  }

  if (viewingCertificate) {
    const correspondingQuestionnaire = questionnaires.find(q => q.id === viewingCertificate.questionnaireId);
    if (!correspondingQuestionnaire) {
        return <div>Error: Could not load certificate details. <button onClick={handleCloseCertificate}>Back</button></div>
    }

    return (
        <div>
            <SurveyCertificate result={viewingCertificate} questionnaire={correspondingQuestionnaire} template={certificateTemplate} />
            <div className="text-center mt-4 no-print">
                <button 
                    onClick={handleCloseCertificate}
                    className="px-6 py-2 text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white" style={{fontFamily: "'Playfair Display', serif"}}>Welcome, {currentUser.firstName}!</h2>
        <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">Ready to discover your strengths?</p>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-6">Available Surveys</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionnaires.map((q) => (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col justify-between transition-transform hover:scale-105 duration-300">
              <div className="flex-grow">
                 <BriefcaseIcon className="h-8 w-8 text-orange-500 mb-3" />
                 <h4 className="text-lg font-bold text-slate-900 dark:text-white">{q.title}</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{q.questions.length} questions</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => handleStartSurvey(q)}
                  className="w-full px-6 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Start Survey
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-6">My Certificates</h3>
        {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col justify-between transition-transform hover:scale-105 duration-300 group">
                       <div className="flex-grow">
                         <CheckCircleIcon className="h-8 w-8 text-green-500 mb-3" />
                         <h4 className="text-lg font-bold text-slate-900 dark:text-white">{r.questionnaireTitle}</h4>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Completed: {new Date(r.completedAt).toLocaleDateString()}</p>
                         <p className="mt-4 text-4xl font-bold text-orange-500 dark:text-orange-400">
                            {Math.round((r.totalScore / r.maxScore) * 100)}%
                         </p>
                       </div>
                       <div className="mt-6">
                            <button onClick={() => setViewingCertificate(r)} className="w-full text-center text-sm font-semibold text-orange-500 hover:text-orange-400 group-hover:underline">
                                View Certificate
                            </button>
                       </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">You haven't completed any surveys yet.</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Start one above to get your first certificate!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
