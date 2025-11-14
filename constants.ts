
import { Questionnaire, SurveyResult, User } from './types';

export const LIKERT_OPTIONS = [
    { text: "Strongly Disagree", score: 1 },
    { text: "Disagree", score: 2 },
    { text: "Neutral", score: 3 },
    { text: "Agree", score: 4 },
    { text: "Strongly Agree", score: 5 },
];

export const sampleQuestionnaires: Questionnaire[] = [
  {
    id: 'q1',
    title: 'Graduate Role Readiness',
    questions: [
      {
        id: 'q1-1',
        text: 'I am comfortable taking the lead on a project.',
        trait: 'Leadership',
        behavior: 'Initiative',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q1-2',
        text: 'I enjoy collaborating with others to find a solution.',
        trait: 'Teamwork',
        behavior: 'Collaboration',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q1-3',
        text: 'When faced with a complex problem, I break it down into smaller parts.',
        trait: 'Problem Solving',
        behavior: 'Analytical Thinking',
        options: LIKERT_OPTIONS,
      },
    ],
  },
];

export const sampleUsers: User[] = [
  {
    id: 'admin-001',
    firstName: 'Rakesh',
    middleName: '',
    lastName: 'Doon',
    email: 'rakesh.doon@gmail.com',
    password: '123456',
    role: 'admin',
  },
  {
    id: 'user-001',
    firstName: 'Alex',
    middleName: '',
    lastName: 'Doe',
    email: 'alex.doe@example.com',
    password: 'password',
    role: 'user',
  },
  {
    id: 'rec-001',
    firstName: 'Recruiter',
    middleName: '',
    lastName: 'Person',
    email: 'rec@foo.com',
    password: '123456',
    role: 'recruiter',
  }
];

export const sampleResults: SurveyResult[] = [
    {
        id: 'res1',
        userId: 'user-001',
        userName: 'Alex Doe',
        questionnaireId: 'q1',
        questionnaireTitle: 'Graduate Role Readiness',
        answers: [
            { questionId: 'q1-1', score: 4 },
            { questionId: 'q1-2', score: 5 },
            { questionId: 'q1-3', score: 4 },
        ],
        totalScore: 13,
        maxScore: 15,
        completedAt: new Date().toISOString(),
    }
];