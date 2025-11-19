

import React, { useState } from 'react';
import { Questionnaire, SurveyResult, User } from '../types';
import UserSurvey from './UserSurvey';

interface UserSurveySelectorProps {
  questionnaires: Questionnaire[];
  onSurveyComplete: (result: SurveyResult) => void;
  currentUser: User;
}

const UserSurveySelector: React.FC<UserSurveySelectorProps> = ({ questionnaires, onSurveyComplete, currentUser }) => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const handleStartSurvey = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
  };

  const handleComplete = (result: SurveyResult) => {
    onSurveyComplete(result);
    setSelectedQuestionnaire(null); // Go back to the selection screen
  };

  if (selectedQuestionnaire) {
    return <UserSurvey questionnaire={selectedQuestionnaire} onComplete={handleComplete} currentUser={currentUser} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Behavioral Surveys</h2>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Select a survey to begin your assessment.</p>
      </div>
      <div className="space-y-4">
        {questionnaires.map((q) => (
          <div key={q.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{q.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{q.questions.length} questions</p>
            </div>
            <button
              onClick={() => handleStartSurvey(q)}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Start Survey
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSurveySelector;