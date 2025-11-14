export interface User {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'recruiter';
}

export const USER_ROLES: User['role'][] = ['admin', 'user', 'recruiter'];

export interface Question {
  id: string;
  text: string;
  trait: string;
  behavior?: string;
  options: { text: string; score: number }[];
}

export interface Questionnaire {
  id:string;
  title: string;
  questions: Question[];
}

export interface SurveyResult {
  id: string;
  userId: string;
  userName: string;
  questionnaireId: string;
  questionnaireTitle: string;
  answers: { questionId: string; score: number }[];
  totalScore: number;
  maxScore: number;
  completedAt: string;
}

export interface CertificateTemplate {
  showOverallScore: boolean;
  showTraitScores: boolean;
  showLogo: boolean;
  showSignature: boolean;
  customMessage: string;
  logoUrl: string | null;
  signatureUrl: string | null;
  showWatermark: boolean;
  watermarkText: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
}

export const behavioralTraits = [
  "Teamwork",
  "Problem Solving",
  "Leadership",
  "Adaptability",
  "Communication",
  "Work Ethic",
  "Creativity",
  "Attention to Detail"
];