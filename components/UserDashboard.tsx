import React, { useState } from 'react';
import { Questionnaire, SurveyResult, User, CertificateTemplate } from '../types';
import UserSurvey from './UserSurvey';
import SurveyCertificate from './SurveyCertificate';
import { LogoutIcon } from './icons';

interface UserDashboardProps {
  currentUser: User;
  questionnaires: Questionnaire[];
  results: SurveyResult[];
  onSurveyComplete: (result: SurveyResult) => void;
  onLogout: () => void;
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

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, questionnaires, results, onSurveyComplete, onLogout, onShowNotification, certificateTemplate }) => {
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
        // Handle case where questionnaire is not found, though this shouldn't happen in normal flow
        return <div>Error: Could not load certificate details. <button onClick={handleCloseCertificate}>Back</button></div>
    }

    return (
        <div className="printable-area">
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
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {currentUser.firstName}!</h2>
            <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">Ready to discover your strengths?</p>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
            <LogoutIcon className="h-5 w-5" />
            <span>Logout</span>
        </button>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Available Surveys</h3>
        <div className="space-y-4">
          {questionnaires.map((q) => (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-center justify-between">
              <div>
                <h4 className="text-xl font-semibold">{q.title}</h4>
                <p className="text-slate-500 dark:text-slate-400">{q.questions.length} questions</p>
              </div>
              <button
                onClick={() => handleStartSurvey(q)}
                className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Survey
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-4">My Certificates</h3>
        {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
                       <div>
                         <h4 className="text-lg font-semibold">{r.questionnaireTitle}</h4>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Completed on {new Date(r.completedAt).toLocaleDateString()}</p>
                         <p className="mt-4 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {Math.round((r.totalScore / r.maxScore) * 100)}%
                         </p>
                       </div>
                       <div className="mt-4 flex justify-end">
                            <button onClick={() => setViewingCertificate(r)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                View Certificate
                            </button>
                       </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">You haven't completed any surveys yet. Start one above to get your first certificate!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;