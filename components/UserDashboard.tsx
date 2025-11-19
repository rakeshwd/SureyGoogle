

import React, { useState, useRef, useEffect } from 'react';
import { Questionnaire, SurveyResult, User, CertificateTemplate } from '../types';
import UserSurvey from './UserSurvey';
import SurveyCertificate from './SurveyCertificate';
import { BriefcaseIcon, CheckCircleIcon, LinkedInIcon, TwitterIcon, DownloadIcon, ShareIcon } from './icons';

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

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
      window.print();
  };

  const handleNativeShare = async () => {
    if (viewingCertificate && navigator.share) {
         const percentageScore = Math.round((viewingCertificate.totalScore / viewingCertificate.maxScore) * 100);
         try {
            await navigator.share({
                title: 'My USCORE Assessment Result',
                text: `I just scored ${percentageScore}% on the ${viewingCertificate.questionnaireTitle} assessment! Check out USCORE to verify your behavioral skills.`,
                url: window.location.origin,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    }
  };

  // Certificate Scaling Logic
  const certificateContainerRef = useRef<HTMLDivElement>(null);
  const [certificateScale, setCertificateScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (viewingCertificate && certificateContainerRef.current) {
        const container = certificateContainerRef.current;
        const containerWidth = container.offsetWidth;
        const contentWidth = 1024;
        
        if (containerWidth < contentWidth) {
            setCertificateScale(containerWidth / contentWidth);
        } else {
            setCertificateScale(1);
        }
      }
    };
    
    if (viewingCertificate) {
        calculateScale();
        window.addEventListener('resize', calculateScale);
    }
    
    return () => window.removeEventListener('resize', calculateScale);
  }, [viewingCertificate]);


  if (activeSurvey) {
    return <UserSurvey questionnaire={activeSurvey} onComplete={handleSurveyCompletion} currentUser={currentUser} />;
  }

  if (viewingCertificate) {
    const correspondingQuestionnaire = questionnaires.find(q => q.id === viewingCertificate.questionnaireId);
    if (!correspondingQuestionnaire) {
        return <div>Error: Could not load certificate details. <button onClick={handleCloseCertificate}>Back</button></div>
    }

    const percentageScore = Math.round((viewingCertificate.totalScore / viewingCertificate.maxScore) * 100);
    const appUrl = window.location.origin;
    const shareText = `I just scored ${percentageScore}% on the ${viewingCertificate.questionnaireTitle} assessment! Check out USCORE to verify your behavioral skills.`;
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent('My USCORE Assessment Result')}&summary=${encodeURIComponent(shareText)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
    const canShare = typeof navigator !== 'undefined' && !!navigator.share;

    return (
        <div className="flex flex-col items-center">
            {/* Constrain container to tablet size (max-w-3xl) to trigger scaling */}
            <div ref={certificateContainerRef} className="w-full max-w-3xl overflow-hidden flex justify-center shadow-2xl rounded-lg">
                 <div style={{ 
                     transform: `scale(${certificateScale})`, 
                     transformOrigin: 'top center', 
                     width: '1024px', 
                     height: '722px', 
                     marginBottom: `-${722 * (1 - certificateScale)}px` 
                 }}>
                    <SurveyCertificate 
                        result={viewingCertificate} 
                        questionnaire={correspondingQuestionnaire} 
                        template={certificateTemplate} 
                        showActions={false} 
                    />
                 </div>
            </div>

            {/* Sharing Section */}
            <div className="w-full max-w-3xl mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 border border-slate-100 dark:border-slate-700 no-print">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Celebrate Your Achievement!</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        You've earned a score of <span className="font-bold text-orange-500">{percentageScore}%</span>. Sharing this certificate can increase your visibility to top recruiters by 3x.
                    </p>
                </div>
                
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${canShare ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                    {canShare && (
                        <button
                            onClick={handleNativeShare}
                            className="flex items-center justify-center px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-transform transform hover:scale-105 font-semibold shadow-md"
                        >
                            <ShareIcon className="w-6 h-6 mr-2" />
                            Share
                        </button>
                    )}
                    <button
                        onClick={() => handleShare(linkedInShareUrl)}
                        className="flex items-center justify-center px-4 py-3 bg-[#0077B5] hover:bg-[#005582] text-white rounded-lg transition-transform transform hover:scale-105 font-semibold shadow-md"
                    >
                        <LinkedInIcon className="w-6 h-6 mr-2" />
                        Share on LinkedIn
                    </button>
                     <button
                        onClick={() => handleShare(twitterShareUrl)}
                        className="flex items-center justify-center px-4 py-3 bg-[#1DA1F2] hover:bg-[#0c85d0] text-white rounded-lg transition-transform transform hover:scale-105 font-semibold shadow-md"
                    >
                        <TwitterIcon className="w-6 h-6 mr-2" />
                        Share on Twitter
                    </button>
                     <button
                        onClick={handleDownload}
                        className="flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-transform transform hover:scale-105 font-semibold shadow-md"
                    >
                        <DownloadIcon className="w-6 h-6 mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="text-center mt-8 no-print">
                <button 
                    onClick={handleCloseCertificate}
                    className="px-6 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
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
