import React, { useMemo } from 'react';
import { SurveyResult, CertificateTemplate, Questionnaire } from '../types';
import { LinkedInIcon, TwitterIcon, ImageIcon, SignatureIcon } from './icons';

interface SurveyCertificateProps {
  result: SurveyResult;
  questionnaire: Questionnaire;
  template: CertificateTemplate;
}

const TraitScoreBar: React.FC<{ trait: string; score: number; maxScore: number }> = ({ trait, score, maxScore }) => {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{trait}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const SurveyCertificate: React.FC<SurveyCertificateProps> = ({ result, questionnaire, template }) => {
  const percentageScore = Math.round((result.totalScore / result.maxScore) * 100);
  
  const traitScores = useMemo(() => {
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
    return Object.entries(scoresByTrait);
  }, [result, questionnaire]);
  
  const appUrl = window.location.href;
  const shareText = `I just completed the "${result.questionnaireTitle}" assessment and scored ${percentageScore}%! Find out your own professional strengths.`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(result.questionnaireTitle)}&summary=${encodeURIComponent(shareText)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-4 border-indigo-200 dark:border-indigo-900 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-50 transform -skew-y-6"></div>
            
            <div className="relative z-10">
                {template.showLogo && (
                    <div className="mb-6 flex justify-center">
                        {template.logoUrl ? (
                            <img src={template.logoUrl} alt="Company Logo" className="h-16 w-auto" />
                        ) : (
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-slate-500" />
                            </div>
                        )}
                    </div>
                )}
                <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Certificate of Completion</h1>
                <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">This certifies that</p>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold text-indigo-600 dark:text-indigo-400">{result.userName}</p>
                <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">has successfully completed the</p>
                <p className="mt-2 text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-100">{result.questionnaireTitle}</p>
                
                {template.showOverallScore && (
                    <div className="mt-10">
                        <p className="text-lg text-slate-500 dark:text-slate-400">Overall Score</p>
                        <p className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mt-2">{percentageScore}%</p>
                        <p className="text-md text-slate-500 dark:text-slate-400">({result.totalScore} out of {result.maxScore} points)</p>
                    </div>
                )}

                {template.showTraitScores && (
                    <div className="mt-10 text-left max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-center mb-4">Trait Breakdown</h3>
                        <div className="space-y-4">
                            {traitScores.map(([trait, scores]) => (
                                <TraitScoreBar key={trait} trait={trait} score={scores.totalScore} maxScore={scores.maxScore} />
                            ))}
                        </div>
                    </div>
                )}
                
                {template.customMessage && (
                    <p className="mt-10 text-md text-slate-600 dark:text-slate-300 italic max-w-2xl mx-auto">"{template.customMessage}"</p>
                )}

                {template.showSignature && (
                     <div className="mt-10">
                        {template.signatureUrl ? (
                            <img src={template.signatureUrl} alt="Signature" className="h-12 w-auto mx-auto" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <SignatureIcon className="h-12 w-24 text-slate-600 dark:text-slate-400" />
                            </div>
                        )}
                        <div className="w-48 h-px bg-slate-400 dark:bg-slate-600 mx-auto mt-1"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Authorized Signature</p>
                    </div>
                )}

                <div className="mt-10 text-xs text-slate-400">
                    <p>Completed on: {new Date(result.completedAt).toLocaleDateString()}</p>
                    <p>Certificate ID: {result.id}</p>
                </div>
            </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
            <button
                onClick={() => window.print()}
                className="w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            >
                Download or Print
            </button>
            <div className="w-full flex items-center space-x-2">
                <button onClick={() => handleShare(twitterShareUrl)} className="w-full flex justify-center items-center space-x-2 p-3 bg-[#1DA1F2] text-white font-semibold rounded-lg shadow-md hover:bg-[#0c85d0] focus:outline-none">
                    <TwitterIcon className="h-5 w-5"/>
                    <span>Share</span>
                </button>
                <button onClick={() => handleShare(linkedInShareUrl)} className="w-full flex justify-center items-center space-x-2 p-3 bg-[#0077B5] text-white font-semibold rounded-lg shadow-md hover:bg-[#005582] focus:outline-none">
                    <LinkedInIcon className="h-5 w-5"/>
                    <span>Share</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default SurveyCertificate;