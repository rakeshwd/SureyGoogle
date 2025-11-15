import React, { useMemo } from 'react';
import { SurveyResult, CertificateTemplate, Questionnaire } from '../types';
import { LinkedInIcon, TwitterIcon, ImageIcon, SignatureIcon, DownloadIcon } from './icons';

const TraitScoreBar: React.FC<{ trait: string; score: number; maxScore: number }> = ({ trait, score, maxScore }) => {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{trait}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div 
                    className="bg-orange-500 h-1.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

// Fix: Defined SurveyCertificateProps interface for the component props.
interface SurveyCertificateProps {
  result: SurveyResult;
  questionnaire: Questionnaire;
  template: CertificateTemplate;
}

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
  
  const handleDownload = () => {
    window.print();
  };


  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Certificate Component */}
        <div 
            className="printable-area w-[1024px] h-[722px] bg-white dark:bg-slate-800 shadow-2xl flex font-serif relative overflow-hidden" 
            style={{ fontFamily: "'Lato', sans-serif" }}
        >
            {/* Watermark */}
            {template.showWatermark && template.watermarkText && (
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <p 
                        className="text-8xl font-black uppercase text-slate-200/50 dark:text-slate-700/50 transform -rotate-45 select-none"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                    >
                        {template.watermarkText}
                    </p>
                </div>
            )}

            {/* Decorative Side Panel */}
            <div className="w-[340px] bg-slate-50 dark:bg-slate-900 p-8 flex flex-col justify-between relative z-10">
                <div>
                    {template.showLogo && (
                        <div className="mb-6">
                            {template.logoUrl ? (
                                <img src={template.logoUrl} alt="Company Logo" className="h-40 w-auto" />
                            ) : (
                                <div className="w-40 h-40 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <ImageIcon className="w-20 h-20 text-slate-500" />
                                </div>
                            )}
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200" style={{fontFamily: "'Playfair Display', serif"}}>Certificate of</h1>
                    <h2 className="text-5xl font-bold text-orange-500 dark:text-orange-400" style={{fontFamily: "'Playfair Display', serif"}}>Achievement</h2>
                    {template.customMessage && (
                        <p className="mt-8 text-sm text-slate-600 dark:text-slate-300 italic">"{template.customMessage}"</p>
                    )}
                </div>
                <div>
                     {template.showSignature && (
                         <div className="mt-10">
                            {template.signatureUrl ? (
                                <img src={template.signatureUrl} alt="Signature" className="h-12 w-auto" />
                            ) : (
                                <SignatureIcon className="h-12 w-24 text-slate-600 dark:text-slate-400" />
                            )}
                            <div className="w-48 h-px bg-slate-400 dark:bg-slate-600 mt-1"></div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Authorized Signature</p>
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-4">
                        Issued on: {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Main Content Panel */}
            <div className="flex-1 p-12 flex flex-col justify-center relative z-10">
                <p className="text-md uppercase tracking-widest text-slate-500 dark:text-slate-400">This certifies that</p>
                <p className="mt-2 text-5xl font-bold text-slate-800 dark:text-slate-100" style={{fontFamily: "'Playfair Display', serif"}}>{result.userName}</p>
                <p className="mt-4 text-md text-slate-500 dark:text-slate-400">has successfully completed the assessment for</p>
                <p className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-200">{result.questionnaireTitle}</p>
                
                <div className="mt-10 w-full flex items-center space-x-12">
                     {template.showOverallScore && (
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Overall Score</p>
                            <p className="text-7xl font-bold text-slate-900 dark:text-white mt-1">{percentageScore}<span className="text-4xl">%</span></p>
                        </div>
                    )}
                     {template.showTraitScores && (
                        <div className="flex-1">
                             <h3 className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Trait Breakdown</h3>
                             <div className="space-y-3">
                                {traitScores.map(([trait, scores]) => (
                                    <TraitScoreBar key={trait} trait={trait} score={scores.totalScore} maxScore={scores.maxScore} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                 <p className="text-xs text-slate-400 mt-auto text-right">Certificate ID: {result.id}</p>
            </div>
            
             {/* Decorative watermark/seal */}
            <div className="absolute bottom-8 right-8 z-20">
                <div className="w-24 h-24 border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-amber-400 rounded-full text-center flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-amber-500">BEHAVIORAL</span>
                        <span className="text-xs font-bold text-amber-500">ASSESSMENT</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-lg no-print">
            <button
                onClick={handleDownload}
                className="w-full inline-flex justify-center items-center px-8 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download as PDF
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
