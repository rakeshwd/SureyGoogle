import { Questionnaire, SurveyResult, User, CertificateTemplate, AuditLog } from '../types';
import { sampleQuestionnaires, sampleResults, sampleUsers } from '../constants';
// FIX: Corrected import to pull from the consolidated defaults file.
import { defaultLogo, defaultSignature } from '../assets/defaults';

// --- Helper Functions ---
const SIMULATED_DELAY = 250; // ms

const simulateNetwork = () => new Promise(res => setTimeout(res, SIMULATED_DELAY));

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        const item = JSON.stringify(value);
        window.localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error saving to localStorage key “${key}”:`, error);
    }
};


// Initialize with sample data if storage is empty
const initializeData = () => {
    if (!localStorage.getItem('questionnaires')) {
        saveToStorage('questionnaires', sampleQuestionnaires);
    }
    if (!localStorage.getItem('results')) {
        saveToStorage('results', sampleResults);
    }
    if (!localStorage.getItem('allUsers')) {
        saveToStorage('allUsers', sampleUsers);
    }
    if (!localStorage.getItem('certificateTemplate')) {
        const defaultCertificateTemplate: CertificateTemplate = {
            showOverallScore: true,
            showTraitScores: true,
            showLogo: true,
            showSignature: true,
            customMessage: "Congratulations on your achievement! This certificate reflects your dedication and developing strengths.",
            logoUrl: defaultLogo,
            signatureUrl: defaultSignature,
            showWatermark: false,
            watermarkText: null,
        };
        saveToStorage('certificateTemplate', defaultCertificateTemplate);
    }
    if (!localStorage.getItem('auditLogs')) {
        saveToStorage('auditLogs', []);
    }
};
initializeData();


// --- API Functions ---

// Questionnaires
export const fetchQuestionnaires = async (): Promise<Questionnaire[]> => {
    await simulateNetwork();
    return getFromStorage<Questionnaire[]>('questionnaires', []);
};

export const saveQuestionnaire = async (quest: Questionnaire): Promise<Questionnaire> => {
    await simulateNetwork();
    const questionnaires = getFromStorage<Questionnaire[]>('questionnaires', []);
    const index = questionnaires.findIndex(q => q.id === quest.id);
    if (index > -1) {
        questionnaires[index] = quest;
    } else {
        questionnaires.push(quest);
    }
    saveToStorage('questionnaires', questionnaires);
    return quest;
};

export const deleteQuestionnaire = async (id: string): Promise<void> => {
    await simulateNetwork();
    let questionnaires = getFromStorage<Questionnaire[]>('questionnaires', []);
    questionnaires = questionnaires.filter(q => q.id !== id);
    saveToStorage('questionnaires', questionnaires);
};

// Results
export const fetchResults = async (): Promise<SurveyResult[]> => {
    await simulateNetwork();
    return getFromStorage<SurveyResult[]>('results', []);
};

export const saveResult = async (result: SurveyResult): Promise<SurveyResult> => {
    await simulateNetwork();
    const results = getFromStorage<SurveyResult[]>('results', []);
    results.push(result);
    saveToStorage('results', results);
    return result;
};

// Users & Auth
export const fetchUsers = async (): Promise<User[]> => {
    await simulateNetwork();
    return getFromStorage<User[]>('allUsers', []);
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    await simulateNetwork();
    const users = getFromStorage<User[]>('allUsers', []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const registerUser = async (userData: Omit<User, 'id' | 'role'>): Promise<User> => {
    await simulateNetwork();
    const users = getFromStorage<User[]>('allUsers', []);
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        role: 'user',
    };
    users.push(newUser);
    saveToStorage('allUsers', users);
    return newUser;
};

export type LoginResult = {
  user?: User;
  error?: 'not_found' | 'incorrect_password';
};

export const login = async (email: string, password: string): Promise<LoginResult> => {
    await simulateNetwork();
    const users = getFromStorage<User[]>('allUsers', []);
    const userByEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userByEmail) {
        return { error: 'not_found' };
    }

    if (userByEmail.password !== password) {
        return { error: 'incorrect_password' };
    }
    
    saveToStorage('currentUser', userByEmail);
    return { user: userByEmail };
};

export const logout = async (): Promise<void> => {
    await simulateNetwork();
    localStorage.removeItem('currentUser');
};

export const getCurrentUser = async (): Promise<User | null> => {
    await simulateNetwork();
    return getFromStorage<User | null>('currentUser', null);
};

export const updateUser = async (userToUpdate: User): Promise<User> => {
    await simulateNetwork();
    const users = getFromStorage<User[]>('allUsers', []);
    const index = users.findIndex(u => u.id === userToUpdate.id);
    if (index > -1) {
        users[index] = userToUpdate;
        saveToStorage('allUsers', users);
    } else {
        throw new Error("User not found for update");
    }
    return userToUpdate;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await simulateNetwork();
    let users = getFromStorage<User[]>('allUsers', []);
    users = users.filter(u => u.id !== userId);
    saveToStorage('allUsers', users);
};


// Certificate Template
export const fetchCertificateTemplate = async (): Promise<CertificateTemplate> => {
    await simulateNetwork();
    const defaultTemplate = { showOverallScore: true, showTraitScores: true, showLogo: true, showSignature: true, customMessage: "", logoUrl: null, signatureUrl: null, showWatermark: false, watermarkText: null };
    return getFromStorage<CertificateTemplate>('certificateTemplate', defaultTemplate);
};

export const saveCertificateTemplate = async (template: CertificateTemplate): Promise<CertificateTemplate> => {
    await simulateNetwork();
    saveToStorage('certificateTemplate', template);
    return template;
};

// Audit Logs
export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    await simulateNetwork();
    return getFromStorage<AuditLog[]>('auditLogs', []);
};

export const saveAuditLog = async (action: string, details: string, currentUser: User): Promise<AuditLog> => {
    await simulateNetwork();
    const logs = getFromStorage<AuditLog[]>('auditLogs', []);
    const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminId: currentUser.id,
        adminName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        action,
        details,
    };
    logs.unshift(newLog);
    saveToStorage('auditLogs', logs);
    return newLog;
};