

import { Questionnaire, SurveyResult, User } from './types';

export const LIKERT_OPTIONS = [
    { text: "Strongly Disagree", score: 1 },
    { text: "Disagree", score: 2 },
    { text: "Neutral", score: 3 },
    { text: "Agree", score: 4 },
    { text: "Strongly Agree", score: 5 },
];

export const THREE_POINT_OPTIONS = [
    { text: "Disagree", score: 1 },
    { text: "Neutral", score: 2 },
    { text: "Agree", score: 3 },
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
  {
    id: 'q2',
    title: 'Professional Workplace Assessment',
    questions: [
        // Honesty
        { id: 'q2-1', text: "I always tell the truth even when it's difficult.", trait: 'Honesty', options: THREE_POINT_OPTIONS },
        { id: 'q2-2', text: "If I make a mistake at work, I admit it rather than hide it.", trait: 'Honesty', options: THREE_POINT_OPTIONS },
        { id: 'q2-3', text: "I act honestly, even when no one is watching.", trait: 'Honesty', options: THREE_POINT_OPTIONS },
        { id: 'q2-4', text: "If a colleague asks me to cover up something improper, I would refuse.", trait: 'Honesty', options: THREE_POINT_OPTIONS },
        { id: 'q2-5', text: "I follow through on ethical principles even under pressure.", trait: 'Honesty', options: THREE_POINT_OPTIONS },
        // Reliability
        { id: 'q2-6', text: "I complete my tasks on or before the deadline.", trait: 'Reliability', options: THREE_POINT_OPTIONS },
        { id: 'q2-7', text: "I consistently meet the commitments I make to my team.", trait: 'Reliability', options: THREE_POINT_OPTIONS },
        { id: 'q2-8', text: "I maintain a high standard of work, even for routine tasks.", trait: 'Reliability', options: THREE_POINT_OPTIONS },
        { id: 'q2-9', text: "When I say I'll do something, others can count on me.", trait: 'Reliability', options: THREE_POINT_OPTIONS },
        { id: 'q2-10', text: "I manage my workload so that I don’t miss important deadlines.", trait: 'Reliability', options: THREE_POINT_OPTIONS },
        // Initiative
        { id: 'q2-11', text: "I proactively look for ways to improve how things are done.", trait: 'Initiative', options: THREE_POINT_OPTIONS },
        { id: 'q2-12', text: "I volunteer for new tasks, even if they’re not part of my usual role.", trait: 'Initiative', options: THREE_POINT_OPTIONS },
        { id: 'q2-13', text: "When I spot a problem, I suggest solutions instead of waiting.", trait: 'Initiative', options: THREE_POINT_OPTIONS },
        { id: 'q2-14', text: "I take action without being explicitly told what to do.", trait: 'Initiative', options: THREE_POINT_OPTIONS },
        { id: 'q2-15', text: "I try to anticipate future challenges and address them beforehand.", trait: 'Initiative', options: THREE_POINT_OPTIONS },
        // Adaptability
        { id: 'q2-16', text: "I handle changes in plans or priorities well.", trait: 'Adaptability', options: THREE_POINT_OPTIONS },
        { id: 'q2-17', text: "I am comfortable learning new tools or methods at work.", trait: 'Adaptability', options: THREE_POINT_OPTIONS },
        { id: 'q2-18', text: "I quickly adjust when working with different kinds of people.", trait: 'Adaptability', options: THREE_POINT_OPTIONS },
        { id: 'q2-19', text: "If a project direction changes, I shift my work without stress.", trait: 'Adaptability', options: THREE_POINT_OPTIONS },
        { id: 'q2-20', text: "I remain effective when unexpected challenges arise.", trait: 'Adaptability', options: THREE_POINT_OPTIONS },
        // Teamwork
        { id: 'q2-21', text: "I actively contribute during team discussions and meetings.", trait: 'Teamwork', options: THREE_POINT_OPTIONS },
        { id: 'q2-22', text: "I respect and consider different viewpoints when collaborating.", trait: 'Teamwork', options: THREE_POINT_OPTIONS },
        { id: 'q2-23', text: "I help my teammates when they need support.", trait: 'Teamwork', options: THREE_POINT_OPTIONS },
        { id: 'q2-24', text: "When conflicts arise, I work to find a constructive resolution.", trait: 'Teamwork', options: THREE_POINT_OPTIONS },
        { id: 'q2-25', text: "I communicate openly with my team to ensure we reach our goals.", trait: 'Teamwork', options: THREE_POINT_OPTIONS }
    ]
  },
  {
    id: 'q3',
    title: 'Core Competency Evaluation',
    questions: [
      {
        id: 'q3-1',
        text: 'I clearly articulate my ideas to my team members.',
        trait: 'Communication',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q3-2',
        text: 'I am persistent in finding solutions to difficult problems.',
        trait: 'Problem Solving',
        options: LIKERT_OPTIONS,
      },
       {
        id: 'q3-3',
        text: 'I take pride in producing high-quality work.',
        trait: 'Work Ethic',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q3-4',
        text: "I actively listen to others' perspectives before responding.",
        trait: 'Teamwork',
        options: LIKERT_OPTIONS,
      }
    ]
  },
  // FIX: Added new questionnaire as requested.
  {
    id: 'q4',
    title: 'IT Skills and Project Management',
    questions: [
      {
        id: 'q4-1',
        text: 'I can quickly learn and adapt to new software and technologies.',
        trait: 'Adaptability',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q4-2',
        text: 'I am proficient in documenting my work for others to understand.',
        trait: 'Communication',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q4-3',
        text: 'I enjoy planning project timelines and deliverables.',
        trait: 'Leadership',
        behavior: 'Planning',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q4-4',
        text: 'I am effective at debugging and solving technical problems under pressure.',
        trait: 'Problem Solving',
        options: LIKERT_OPTIONS,
      },
      {
        id: 'q4-5',
        text: 'I prefer to work in a team to build complex systems.',
        trait: 'Teamwork',
        options: LIKERT_OPTIONS,
      },
    ],
  }
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
    id: 'user-002',
    firstName: 'Alice',
    middleName: '',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    password: 'password',
    role: 'user',
  },
  // FIX: Added new user as requested.
  {
    id: 'user-003',
    firstName: 'John',
    middleName: '',
    lastName: 'Dev',
    email: 'john.dev@example.com',
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
    },
    {
        id: 'res2',
        userId: 'user-001',
        userName: 'Alex Doe',
        questionnaireId: 'q2',
        questionnaireTitle: 'Professional Workplace Assessment',
        answers: [
            { questionId: 'q2-1', score: 3 },
            { questionId: 'q2-2', score: 3 },
            { questionId: 'q2-3', score: 2 },
            { questionId: 'q2-4', score: 3 },
            { questionId: 'q2-5', score: 3 },
            { questionId: 'q2-6', score: 2 },
            { questionId: 'q2-7', score: 3 },
            { questionId: 'q2-8', score: 3 },
            { questionId: 'q2-9', score: 2 },
            { questionId: 'q2-10', score: 3 },
            { questionId: 'q2-11', score: 3 },
            { questionId: 'q2-12', score: 2 },
            { questionId: 'q2-13', score: 3 },
            { questionId: 'q2-14', score: 2 },
            { questionId: 'q2-15', score: 3 },
            { questionId: 'q2-16', score: 3 },
            { questionId: 'q2-17', score: 3 },
            { questionId: 'q2-18', score: 2 },
            { questionId: 'q2-19', score: 3 },
            { questionId: 'q2-20', score: 2 },
            { questionId: 'q2-21', score: 3 },
            { questionId: 'q2-22', score: 3 },
            { questionId: 'q2-23', score: 2 },
            { questionId: 'q2-24', score: 3 },
            { questionId: 'q2-25', score: 3 },
        ],
        totalScore: 65,
        maxScore: 75,
        completedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
    {
        id: 'res3',
        userId: 'user-002',
        userName: 'Alice Smith',
        questionnaireId: 'q3',
        questionnaireTitle: 'Core Competency Evaluation',
        answers: [
            { questionId: 'q3-1', score: 4 },
            { questionId: 'q3-2', score: 5 },
            { questionId: 'q3-3', score: 4 },
            { questionId: 'q3-4', score: 5 },
        ],
        totalScore: 18,
        maxScore: 20,
        completedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    // FIX: Added new result for the new user and questionnaire.
    {
        id: 'res4',
        userId: 'user-003',
        userName: 'John Dev',
        questionnaireId: 'q4',
        questionnaireTitle: 'IT Skills and Project Management',
        answers: [
            { questionId: 'q4-1', score: 5 },
            { questionId: 'q4-2', score: 4 },
            { questionId: 'q4-3', score: 4 },
            { questionId: 'q4-4', score: 5 },
            { questionId: 'q4-5', score: 3 },
        ],
        totalScore: 21,
        maxScore: 25,
        completedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    }
];