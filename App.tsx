import React, { useState, useEffect } from 'react';
import { Questionnaire, SurveyResult, User, CertificateTemplate, AuditLog } from './types';
import * as api from './services/api';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserAuth from './components/UserAuth';
import LoginPage from './components/LoginPage';
import Notification from './components/Notification';
import RecruiterDashboard from './components/RecruiterDashboard';
import { ImageIcon, LogoutIcon } from './components/icons';
import { SpinnerIcon } from './components/icons';


const App: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [notification, setNotification] = useState<string | null>(null);
  const [certificateTemplate, setCertificateTemplate] = useState<CertificateTemplate | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const [
            loadedUsers, 
            loadedQuests, 
            loadedResults, 
            loadedTemplate, 
            loadedLogs,
            loadedCurrentUser
        ] = await Promise.all([
            api.fetchUsers(),
            api.fetchQuestionnaires(),
            api.fetchResults(),
            api.fetchCertificateTemplate(),
            api.fetchAuditLogs(),
            api.getCurrentUser()
        ]);
        
        setAllUsers(loadedUsers);
        setQuestionnaires(loadedQuests);
        setResults(loadedResults);
        setCertificateTemplate(loadedTemplate);
        setAuditLogs(loadedLogs);
        setCurrentUser(loadedCurrentUser);
        setIsLoading(false);
    };
    loadData();
  }, []);


  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(null);
    }, 5000); // Notification disappears after 5 seconds
  };
  
  const addAuditLog = async (action: string, details: string) => {
    if (currentUser && currentUser.role === 'admin') {
        const newLog = await api.saveAuditLog(action, details, currentUser);
        setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const handleSaveQuestionnaire = async (quest: Questionnaire) => {
    const isNew = !questionnaires.some(q => q.id === quest.id);
    const action = isNew ? "Created Questionnaire" : "Updated Questionnaire";
    
    const savedQuest = await api.saveQuestionnaire(quest);
    
    setQuestionnaires(prev => {
      const index = prev.findIndex(q => q.id === savedQuest.id);
      if (index > -1) {
        const newQuests = [...prev];
        newQuests[index] = savedQuest;
        return newQuests;
      }
      return [...prev, savedQuest];
    });
    addAuditLog(action, `Title: "${savedQuest.title}"`);
  };

  const handleDeleteQuestionnaire = async (id: string) => {
    const deletedQuest = questionnaires.find(q => q.id === id);
    await api.deleteQuestionnaire(id);
    setQuestionnaires(prev => prev.filter(q => q.id !== id));
    if (deletedQuest) {
        addAuditLog("Deleted Questionnaire", `Title: "${deletedQuest.title}"`);
    }
  };

  const handleSurveyComplete = async (result: SurveyResult) => {
    const newResult = await api.saveResult(result);
    setResults(prev => [...prev, newResult]);
  };
  
  const handleSaveCertificateTemplate = async (template: CertificateTemplate) => {
    const savedTemplate = await api.saveCertificateTemplate(template);
    setCertificateTemplate(savedTemplate);
    addAuditLog("Updated Certificate Template", "Admin updated the certificate appearance and content.");
    showNotification("Certificate template saved successfully!");
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const user = await api.login(email, password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleRegister = async (user: Omit<User, 'id' | 'role'>) => {
    const existingUser = await api.findUserByEmail(user.email);
     if (existingUser) {
        alert("An account with this email already exists. Please log in.");
        setAuthView('login');
        return;
    }
    const newUser = await api.registerUser(user);
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };
  
  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setAuthView('login');
  };

  const handleUpdateUser = async (user: User) => {
    const updatedUser = await api.updateUser(user);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addAuditLog("Updated User Role", `Set role for "${updatedUser.email}" to "${updatedUser.role}"`);
    showNotification(`Successfully updated role for ${updatedUser.email}.`);
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    if (!userToDelete) return;
    
    await api.deleteUser(userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog("Deleted User", `Deleted user account: "${userToDelete.email}"`);
    showNotification(`Successfully deleted user ${userToDelete.email}.`);
  };
  
  const renderLoading = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <SpinnerIcon className="h-12 w-12 text-orange-500 mx-auto" />
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Loading Application Data...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading || !certificateTemplate) {
        return (
            <div className="flex justify-center items-center pt-20">
                <SpinnerIcon className="h-10 w-10 text-orange-500" />
            </div>
        );
    }

    if (currentUser) {
      if (currentUser.role === 'admin') {
        return (
          <AdminDashboard
            questionnaires={questionnaires}
            results={results}
            onSave={handleSaveQuestionnaire}
            onDelete={handleDeleteQuestionnaire}
            onShowNotification={showNotification}
            certificateTemplate={certificateTemplate}
            onSaveCertificateTemplate={handleSaveCertificateTemplate}
            auditLogs={auditLogs}
            onAddAuditLog={addAuditLog}
            allUsers={allUsers}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      }

      if (currentUser.role === 'recruiter') {
        return (
            <RecruiterDashboard
                questionnaires={questionnaires}
                results={results}
                certificateTemplate={certificateTemplate}
            />
        );
      }
      
      return (
        <UserDashboard
          currentUser={currentUser}
          questionnaires={questionnaires}
          results={results.filter(r => r.userId === currentUser.id)}
          onSurveyComplete={handleSurveyComplete}
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
      <header className="bg-white dark:bg-slate-800 shadow-md no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
                {certificateTemplate?.showLogo && (
                    <>
                        {certificateTemplate.logoUrl ? (
                            <img src={certificateTemplate.logoUrl} alt="USCORE Logo" className="h-10 w-auto" />
                        ) : (
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-slate-500" />
                            </div>
                        )}
                    </>
                )}
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200" style={{fontFamily: "'Playfair Display', serif"}}>
                    USCORE
                </span>
            </div>
            {currentUser && (
                 <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
                    <LogoutIcon className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            )}
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
