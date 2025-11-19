import React, { useState } from 'react';
import { Questionnaire, SurveyResult, User } from '../types';

interface UserSurveyProps {
  questionnaire: Questionnaire;
  onComplete: (result: SurveyResult) => void;
  currentUser: User;
}

const UserSurvey: React.FC<UserSurveyProps> = ({ questionnaire, onComplete, currentUser }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const totalQuestions = questionnaire.questions.length;

  const handleAnswerSelect = (score: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: score });
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    // FIX: Explicitly type the accumulator `sum` as a number and use `Number()` to safely convert the score, resolving the "+" operator error.
    const totalScore = Object.values(answers).reduce((sum: number, score) => sum + Number(score), 0);
    const maxScore = questionnaire.questions.reduce((sum, q) => sum + Math.max(...q.options.map(opt => opt.score)), 0);
    
    const result: SurveyResult = {
        id: `res-${Date.now()}`,
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        questionnaireId: questionnaire.id,
        questionnaireTitle: questionnaire.title,
        // FIX: Use `Number()` to correctly cast the score value, preventing type assignment errors when score is inferred as 'unknown'.
        answers: Object.entries(answers).map(([questionId, score]) => ({ questionId, score: Number(score) })),
        totalScore,
        maxScore,
        completedAt: new Date().toISOString()
    };
    
    onComplete(result);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
        <div className="mb-6">
            <p className="text-sm font-semibold text-orange-500 dark:text-orange-400">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
            </div>
        </div>

        <div role="radiogroup" aria-labelledby="question-text">
            <h2 id="question-text" className="text-2xl md:text-3xl font-bold mb-8 min-h-[6rem] flex items-center">{currentQuestion.text}</h2>

            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                    <label 
                        key={index} 
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            answers[currentQuestion.id] === option.score 
                            ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500 dark:bg-orange-900/50 dark:border-orange-400'
                            : 'border-slate-300 hover:border-orange-400 dark:border-slate-600 dark:hover:border-orange-500'
                        }`}
                    >
                        <input 
                            type="radio"
                            name={currentQuestion.id}
                            value={option.score}
                            checked={answers[currentQuestion.id] === option.score}
                            onChange={() => handleAnswerSelect(option.score)}
                            className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-slate-300 dark:bg-slate-700 dark:border-slate-500"
                        />
                        <span className="ml-4 text-md text-slate-700 dark:text-slate-300">{option.text}</span>
                    </label>
                ))}
            </div>
        </div>

        <div className="mt-10 flex justify-between items-center">
            <button 
                onClick={goToPrev} 
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Back
            </button>
            {currentQuestionIndex < totalQuestions - 1 ? (
                <button 
                    onClick={goToNext}
                    disabled={!answers.hasOwnProperty(currentQuestion.id)}
                    className="px-6 py-2 text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    disabled={!answers.hasOwnProperty(currentQuestion.id)}
                    className="px-6 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                    Submit
                </button>
            )}
        </div>
    </div>
  );
};

export default UserSurvey;