
import { Questionnaire, SurveyResult, User, CertificateTemplate, AuditLog, AppSettings, DataSource } from '../types';
import { sampleQuestionnaires, sampleResults, sampleUsers } from '../constants';
import { defaultLogo } from '../assets/defaults';

// --- Helper Functions ---
const SIMULATED_DELAY = 250; // ms

const simulateNetwork = () => new Promise(res => setTimeout(res, SIMULATED_DELAY));

// --- Data Store Abstraction ---

// In-memory store for "database" mode
let memoryStore: {
    questionnaires: Questionnaire[];
    results: SurveyResult[];
    allUsers: User[];
    certificateTemplate: CertificateTemplate;
    auditLogs: AuditLog[];
    currentUser: User | null;
} | null = null;

const getFreshData = () => ({
    questionnaires: JSON.parse(JSON.stringify(sampleQuestionnaires)),
    results: JSON.parse(JSON.stringify(sampleResults)),
    allUsers: JSON.parse(JSON.stringify(sampleUsers)),
    certificateTemplate: {
        showOverallScore: true,
        showTraitScores: true,
        showLogo: true,
        customMessage: "Congratulations on your achievement! This certificate reflects your dedication and developing strengths.",
        logoUrl: defaultLogo,
        showWatermark: false,
        watermarkText: null,
    },
    auditLogs: [],
    currentUser: null
});

const getMemoryStore = () => {
    if (!memoryStore) {
        memoryStore = getFreshData();
    }
    return memoryStore;
};

// --- Generic localStorage helpers ---
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
    try {
        const item = JSON.stringify(value);
        window.localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error saving to localStorage key “${key}”:`, error);
    }
};

// Functions to interact with the chosen data source
const getDataSource = (): DataSource => {
    const settings = getFromLocalStorage<AppSettings>('appSettings', { dataSource: 'browser' });
    return settings.dataSource;
};

// Initialize with sample data if storage is empty for 'browser' mode
const initializeBrowserData = () => {
    if (!localStorage.getItem('questionnaires')) saveToLocalStorage('questionnaires', sampleQuestionnaires);
    if (!localStorage.getItem('results')) saveToLocalStorage('results', sampleResults);
    if (!localStorage.getItem('allUsers')) saveToLocalStorage('allUsers', sampleUsers);
    if (!localStorage.getItem('certificateTemplate')) saveToLocalStorage('certificateTemplate', getFreshData().certificateTemplate);
    if (!localStorage.getItem('auditLogs')) saveToLocalStorage('auditLogs', []);
};
initializeBrowserData();

// --- App Settings (always uses localStorage) ---
export const fetchAppSettings = async (): Promise<AppSettings> => {
    return getFromLocalStorage<AppSettings>('appSettings', { dataSource: 'browser' });
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
    // When switching to DB mode, clear the in-memory store to force a refresh with sample data
    if (settings.dataSource === 'database') {
        memoryStore = null; 
    }
    saveToLocalStorage('appSettings', settings);
};


// --- API Functions (now use the abstraction) ---

// Questionnaires
export const fetchQuestionnaires = async (): Promise<Questionnaire[]> => {
    await simulateNetwork();
    const source = getDataSource();
    if (source === 'database') {
        return getMemoryStore().questionnaires;
    }
    return getFromLocalStorage<Questionnaire[]>('questionnaires', []);
};

export const saveQuestionnaire = async (quest: Questionnaire): Promise<Questionnaire> => {
    await simulateNetwork();
    const source = getDataSource();
    
    if (source === 'database') {
        const store = getMemoryStore();
        const index = store.questionnaires.findIndex(q => q.id === quest.id);
        if (index > -1) {
            store.questionnaires[index] = quest;
        } else {
            store.questionnaires.push(quest);
        }
    } else {
        const questionnaires = getFromLocalStorage<Questionnaire[]>('questionnaires', []);
        const index = questionnaires.findIndex(q => q.id === quest.id);
        if (index > -1) {
            questionnaires[index] = quest;
        } else {
            questionnaires.push(quest);
        }
        saveToLocalStorage('questionnaires', questionnaires);
    }
    return quest;
};

export const deleteQuestionnaire = async (id: string): Promise<void> => {
    await simulateNetwork();
    const source = getDataSource();
     if (source === 'database') {
        const store = getMemoryStore();
        store.questionnaires = store.questionnaires.filter(q => q.id !== id);
    } else {
        let questionnaires = getFromLocalStorage<Questionnaire[]>('questionnaires', []);
        questionnaires = questionnaires.filter(q => q.id !== id);
        saveToLocalStorage('questionnaires', questionnaires);
    }
};

// Results
export const fetchResults = async (): Promise<SurveyResult[]> => {
    await simulateNetwork();
    const source = getDataSource();
    return source === 'database' ? getMemoryStore().results : getFromLocalStorage<SurveyResult[]>('results', []);
};

export const saveResult = async (result: SurveyResult): Promise<SurveyResult> => {
    await simulateNetwork();
    const source = getDataSource();
    if (source === 'database') {
        getMemoryStore().results.push(result);
    } else {
        const results = getFromLocalStorage<SurveyResult[]>('results', []);
        results.push(result);
        saveToLocalStorage('results', results);
    }
    return result;
};

// Users & Auth
export const fetchUsers = async (): Promise<User[]> => {
    await simulateNetwork();
    const source = getDataSource();
    return source === 'database' ? getMemoryStore().allUsers : getFromLocalStorage<User[]>('allUsers', []);
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    await simulateNetwork();
    const users = await fetchUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const registerUser = async (userData: Omit<User, 'id' | 'role'>): Promise<User> => {
    await simulateNetwork();
    const source = getDataSource();
    const newUser: User = { ...userData, id: `user-${Date.now()}`, role: 'user' };

    if (source === 'database') {
        getMemoryStore().allUsers.push(newUser);
    } else {
        const allUsers = getFromLocalStorage<User[]>('allUsers', []);
        allUsers.push(newUser);
        saveToLocalStorage('allUsers', allUsers);
    }
    return newUser;
};

export type LoginResult = { user?: User; error?: 'not_found' | 'incorrect_password'; };

export const login = async (email: string, password: string): Promise<LoginResult> => {
    await simulateNetwork();
    const users = await fetchUsers();
    const userByEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userByEmail) return { error: 'not_found' };
    if (userByEmail.password !== password) return { error: 'incorrect_password' };
    
    const source = getDataSource();
    if (source === 'database') {
        getMemoryStore().currentUser = userByEmail;
    } else {
        saveToLocalStorage('currentUser', userByEmail);
    }
    return { user: userByEmail };
};

export const logout = async (): Promise<void> => {
    await simulateNetwork();
    const source = getDataSource();
    if (source === 'database') {
        getMemoryStore().currentUser = null;
    } else {
        localStorage.removeItem('currentUser');
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    await simulateNetwork();
    const source = getDataSource();
    if (source === 'database') {
        return getMemoryStore().currentUser;
    }
    return getFromLocalStorage<User | null>('currentUser', null);
};

export const updateUser = async (userToUpdate: User): Promise<User> => {
    await simulateNetwork();
    const source = getDataSource();
    
    let allUsers: User[];
    if (source === 'database') {
        allUsers = getMemoryStore().allUsers;
    } else {
        allUsers = getFromLocalStorage<User[]>('allUsers', []);
    }

    const index = allUsers.findIndex(u => u.id === userToUpdate.id);
    if (index > -1) {
        allUsers[index] = userToUpdate;
        if (source === 'browser') {
            saveToLocalStorage('allUsers', allUsers);
        }
    } else {
        throw new Error("User not found for update");
    }

    return userToUpdate;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await simulateNetwork();
    const source = getDataSource();
    if (source === 'database') {
        const store = getMemoryStore();
        store.allUsers = store.allUsers.filter(u => u.id !== userId);
    } else {
        let allUsers = getFromLocalStorage<User[]>('allUsers', []);
        allUsers = allUsers.filter(u => u.id !== userId);
        saveToLocalStorage('allUsers', allUsers);
    }
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean }> => {
    await simulateNetwork();
    const user = await findUserByEmail(email);

    if (user) {
        const token = Math.random().toString(36).substring(2);
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        const updatedUser: User = {
            ...user,
            passwordResetToken: token,
            passwordResetExpires: expires.toISOString(),
        };

        await updateUser(updatedUser);
        
        // --- SIMULATED EMAIL ---
        // In a real app, you would send an email here.
        // For this simulation, we log the link to the console.
        console.log(`Password reset link for ${email}: ${window.location.origin}?resetToken=${token}`);
        // -------------------------
    }
    
    // Always return success to prevent user enumeration
    return { success: true };
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await simulateNetwork();
    const users = await fetchUsers();
    const user = users.find(u => u.passwordResetToken === token);

    if (!user) {
        return { success: false, error: 'invalid_token' };
    }

    const expires = user.passwordResetExpires ? new Date(user.passwordResetExpires) : new Date(0);
    if (expires < new Date()) {
        return { success: false, error: 'expired_token' };
    }

    const updatedUser: User = {
        ...user,
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
    };
    await updateUser(updatedUser);

    return { success: true };
};

// Certificate Template
export const fetchCertificateTemplate = async (): Promise<CertificateTemplate> => {
    await simulateNetwork();
    const source = getDataSource();
    return source === 'database' ? getMemoryStore().certificateTemplate : getFromLocalStorage<CertificateTemplate>('certificateTemplate', getFreshData().certificateTemplate);
};

export const saveCertificateTemplate = async (template: CertificateTemplate): Promise<CertificateTemplate> => {
    await simulateNetwork();
    const source = getDataSource();
    if (source === 'database') {
        getMemoryStore().certificateTemplate = template;
    } else {
        saveToLocalStorage('certificateTemplate', template);
    }
    return template;
};

// Audit Logs
export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    await simulateNetwork();
    const source = getDataSource();
    return source === 'database' ? getMemoryStore().auditLogs : getFromLocalStorage<AuditLog[]>('auditLogs', []);
};

export const saveAuditLog = async (action: string, details: string, currentUser: User): Promise<AuditLog> => {
    await simulateNetwork();
    const source = getDataSource();
    const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminId: currentUser.id,
        adminName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        action,
        details,
    };
    
    if (source === 'database') {
        getMemoryStore().auditLogs.unshift(newLog);
    } else {
        const auditLogs = getFromLocalStorage<AuditLog[]>('auditLogs', []);
        auditLogs.unshift(newLog);
        saveToLocalStorage('auditLogs', auditLogs);
    }
    return newLog;
};

// Reset All Data
export const deleteAllData = async (): Promise<void> => {
    await simulateNetwork();
    const source = getDataSource();

    if (source === 'database') {
        memoryStore = getFreshData();
    } else {
        localStorage.removeItem('questionnaires');
        localStorage.removeItem('results');
        localStorage.removeItem('allUsers');
        localStorage.removeItem('auditLogs');
        localStorage.removeItem('certificateTemplate');
        localStorage.removeItem('currentUser');
        // Re-initialize with sample data
        initializeBrowserData();
    }
};
