import React, { useState } from 'react';
import { Questionnaire, SurveyResult, User, CertificateTemplate, AuditLog } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sampleQuestionnaires, sampleResults, sampleUsers } from './constants';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserAuth from './components/UserAuth';
import LoginPage from './components/LoginPage';
import Notification from './components/Notification';
import RecruiterDashboard from './components/RecruiterDashboard';

const defaultCertificateTemplate: CertificateTemplate = {
  showOverallScore: true,
  showTraitScores: true,
  showLogo: true,
  showSignature: true,
  customMessage: "Congratulations on your achievement! This certificate reflects your dedication and developing strengths.",
  logoUrl: null,
  signatureUrl: null,
};


const App: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', sampleQuestionnaires);
  const [results, setResults] = useLocalStorage<SurveyResult[]>('results', sampleResults);
  const [allUsers, setAllUsers] = useLocalStorage<User[]>('allUsers', sampleUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [notification, setNotification] = useState<string | null>(null);
  const [certificateTemplate, setCertificateTemplate] = useLocalStorage<CertificateTemplate>('certificateTemplate', defaultCertificateTemplate);
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('auditLogs', []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(null);
    }, 5000); // Notification disappears after 5 seconds
  };
  
  const addAuditLog = (action: string, details: string) => {
    if (currentUser && currentUser.role === 'admin') {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            adminId: currentUser.id,
            adminName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
            action,
            details,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const handleSaveQuestionnaire = (quest: Questionnaire) => {
    const isNew = !questionnaires.some(q => q.id === quest.id);
    const action = isNew ? "Created Questionnaire" : "Updated Questionnaire";
    
    setQuestionnaires(prev => {
      const index = prev.findIndex(q => q.id === quest.id);
      if (index > -1) {
        const newQuests = [...prev];
        newQuests[index] = quest;
        return newQuests;
      }
      return [...prev, quest];
    });
    addAuditLog(action, `Title: "${quest.title}"`);
  };

  const handleDeleteQuestionnaire = (id: string) => {
    const deletedQuest = questionnaires.find(q => q.id === id);
    setQuestionnaires(prev => prev.filter(q => q.id !== id));
    if (deletedQuest) {
        addAuditLog("Deleted Questionnaire", `Title: "${deletedQuest.title}"`);
    }
  };

  const handleSurveyComplete = (result: SurveyResult) => {
    setResults(prev => [...prev, result]);
  };
  
  const handleSaveCertificateTemplate = (template: CertificateTemplate) => {
    setCertificateTemplate(template);
    addAuditLog("Updated Certificate Template", "Admin updated the certificate appearance and content.");
    showNotification("Certificate template saved successfully!");
  };

  const handleLogin = (email: string, password: string): boolean => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleRegister = (user: User) => {
    if (allUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        alert("An account with this email already exists. Please log in.");
        setAuthView('login');
        return;
    }
    setAllUsers(prev => [...prev, user]);
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
  };

  const renderContent = () => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        return (
          <AdminDashboard
            questionnaires={questionnaires}
            results={results}
            onSave={handleSaveQuestionnaire}
            onDelete={handleDeleteQuestionnaire}
            onLogout={handleLogout}
            onShowNotification={showNotification}
            certificateTemplate={certificateTemplate}
            onSaveCertificateTemplate={handleSaveCertificateTemplate}
            auditLogs={auditLogs}
            onAddAuditLog={addAuditLog}
          />
        );
      }

      if (currentUser.role === 'recruiter') {
        return (
            <RecruiterDashboard
                questionnaires={questionnaires}
                results={results}
                onLogout={handleLogout}
            />
        );
      }
      
      return (
        <UserDashboard
          currentUser={currentUser}
          questionnaires={questionnaires}
          results={results.filter(r => r.userId === currentUser.id)}
          onSurveyComplete={handleSurveyComplete}
          onLogout={handleLogout}
          onShowNotification={showNotification}
          certificateTemplate={certificateTemplate}
        />
      );
    }
    
    if (authView === 'login') {
        return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAuthView('register')} />
    }
    
    return <UserAuth onRegister={handleRegister} onNavigateToLogin={() => setAuthView('login')} />
  };

  return (
    <div className="min-h-screen font-sans">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Behavioral Survey Platform
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;