import React, { useState, useRef } from 'react';
import { Questionnaire, SurveyResult, CertificateTemplate, AuditLog, User, USER_ROLES, AppSettings, DataSource } from '../types';
import { PencilIcon, PlusIcon, SendIcon, TrashIcon, SpinnerIcon, CheckCircleIcon, EnvelopeIcon, UploadIcon, DownloadIcon, ClockIcon, UserGroupIcon } from './icons';
import QuestionnaireEditor from './QuestionnaireEditor';
import CertificateTemplateEditor from './CertificateTemplateEditor';
import CandidateSearch from './CandidateSearch';
import ConfirmationModal from './ConfirmationModal';

interface AdminDashboardProps {
  questionnaires: Questionnaire[];
  results: SurveyResult[];
  onSave: (questionnaire: Questionnaire) => void;
  onDelete: (id: string) => void;
  onShowNotification: (message: string) => void;
  certificateTemplate: CertificateTemplate;
  onSaveCertificateTemplate: (template: CertificateTemplate) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, details: string) => void;
  allUsers: User[];
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  appSettings: AppSettings;
  onSaveAppSettings: (settings: AppSettings) => void;
  onDeleteAllData: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  questionnaires, results, onSave, onDelete, onShowNotification, 
  certificateTemplate, onSaveCertificateTemplate, auditLogs, onAddAuditLog, 
  allUsers, currentUser, onUpdateUser, onDeleteUser,
  appSettings, onSaveAppSettings, onDeleteAllData
}) => {
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState<SurveyResult | null>(null);
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const importInputRef = useRef<HTMLInputElement>(null);

  // State for confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<(() => void) | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationTitle, setConfirmationTitle] = useState('');

  const handleCreateNew = () => {
    setEditingQuestionnaire(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setIsEditorOpen(true);
  };

  const handleNotifyUser = (result: SurveyResult) => {
    console.log(`Simulating email notification to ${result.userName}`);
    onShowNotification(`An email notification has been sent to ${result.userName}.`);
  };

  const handleExport = (questionnaire: Questionnaire) => {
    const jsonString = JSON.stringify(questionnaire, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questionnaire.title.replace(/\s/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddAuditLog("Exported Questionnaire", `Title: "${questionnaire.title}"`);
    onShowNotification(`Exported "${questionnaire.title}" successfully.`);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not readable");
        const importedData = JSON.parse(text);

        // Basic validation
        if (!importedData.title || !Array.isArray(importedData.questions)) {
          throw new Error("Invalid questionnaire format.");
        }

        const newQuestionnaire: Questionnaire = {
          ...importedData,
          id: `q-${Date.now()}`, // Assign new ID to prevent collisions
        };
        onSave(newQuestionnaire);
        onShowNotification(`Imported "${newQuestionnaire.title}" successfully.`);
      } catch (error) {
        console.error("Import failed:", error);
        alert(`Failed to import questionnaire: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input for re-uploading the same file
  };
  
  const handleSendResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showSendModal) {
      setPaymentStatus('processing');
      // Simulate API call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Payment successful
      setPaymentStatus('success');
      
      // In a real app, this would trigger a backend service to send the email.
      console.log(`Result for ${showSendModal.userName} sent to ${recruiterEmail}.`);
      onAddAuditLog("Sent Result to Recruiter", `For user: "${showSendModal.userName}", To: ${recruiterEmail}`);
      onShowNotification(`Result for ${showSendModal.userName} sent to ${recruiterEmail}.`)

      // Close modal after a success message delay
      setTimeout(() => {
          setShowSendModal(null);
          setRecruiterEmail('');
          setPaymentStatus('idle'); // Reset for next time
      }, 1500);
    }
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    const userToUpdate = allUsers.find(u => u.id === userId);
    if (userToUpdate) {
        onUpdateUser({ ...userToUpdate, role: newRole });
    }
  };

  const handleDeleteUserClick = (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    setConfirmationTitle('Delete User');
    setConfirmationMessage(`Are you sure you want to delete the user "${userToDelete.email}"? This action cannot be undone.`);
    setConfirmationAction(() => () => onDeleteUser(userId));
    setShowConfirmation(true);
  };
  
  const handleDeleteQuestionnaireClick = (questionnaireId: string) => {
    const questToDelete = questionnaires.find(q => q.id === questionnaireId);
    if (!questToDelete) return;
    setConfirmationTitle('Delete Questionnaire');
    setConfirmationMessage(`Are you sure you want to delete "${questToDelete.title}"? This action cannot be undone.`);
    setConfirmationAction(() => () => onDelete(questionnaireId));
    setShowConfirmation(true);
  };

  const handleDataSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSource = e.target.value as DataSource;
    onSaveAppSettings({ ...appSettings, dataSource: newSource });
  };

  const handleDeleteAllDataClick = () => {
    setConfirmationTitle('Delete All Application Data');
    setConfirmationMessage('Are you sure you want to delete all data? This action is irreversible and will reset all questionnaires, results, users, and settings to their default state.');
    setConfirmationAction(() => async () => {
      await onDeleteAllData();
    });
    setShowConfirmation(true);
  };

  const renderModalContent = () => {
    if (paymentStatus === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center h-48">
                <SpinnerIcon className="h-12 w-12 text-orange-500"/>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Processing payment...</p>
            </div>
        );
    }
    
    if (paymentStatus === 'success') {
        return (
            <div className="flex flex-col items-center justify-center h-48">
                <CheckCircleIcon className="h-16 w-16 text-green-500"/>
                <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Payment Successful!</h3>
                <p className="mt-1 text-slate-600 dark:text-slate-400">The result has been sent.</p>
            </div>
        );
    }

    return (
        <>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Send Result to Recruiter</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This is a paid feature. Enter the recruiter's email to send the behavioral score for <strong>{showSendModal?.userName}</strong>.
            </p>
            <form onSubmit={handleSendResult} className="mt-4 space-y-4">
              <input 
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="recruiter@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                required
              />
              <div className="flex justify-end space-x-3">
                 <button
                  type="button"
                  onClick={() => setShowSendModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  title="Proceed to payment to send result to a recruiter"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <SendIcon className="h-4 w-4 mr-2" />
                  Pay and Send ($5)
                </button>
              </div>
            </form>
        </>
    );
  }

  return (
    <div className="space-y-8">
      {isEditorOpen && (
        <QuestionnaireEditor
          questionnaire={editingQuestionnaire}
          onSave={(q) => {
            onSave(q);
            setIsEditorOpen(false);
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
      
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            {renderModalContent()}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        title={confirmationTitle}
        message={confirmationMessage}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          if (confirmationAction) {
            confirmationAction();
          }
          setShowConfirmation(false);
        }}
      />

      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Certificate Template Section */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Certificate Template</h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <CertificateTemplateEditor
                    template={certificateTemplate}
                    onSave={onSaveCertificateTemplate}
                />
            </div>
        </div>

        {/* Application Settings */}
        <div>
            <h2 className="text-2xl font-bold mb-4">Application Settings</h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <fieldset>
                <legend className="text-base font-medium text-slate-900 dark:text-white">Data Source</legend>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Control where the application reads and writes data.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="browser"
                      name="data-source"
                      type="radio"
                      value="browser"
                      checked={appSettings.dataSource === 'browser'}
                      onChange={handleDataSourceChange}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 dark:bg-slate-700 dark:border-slate-500"
                    />
                    <label htmlFor="browser" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Browser Storage <span className="text-xs text-slate-500">(Persistent)</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="database"
                      name="data-source"
                      type="radio"
                      value="database"
                      checked={appSettings.dataSource === 'database'}
                      onChange={handleDataSourceChange}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 dark:bg-slate-700 dark:border-slate-500"
                    />
                    <label htmlFor="database" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Database <span className="text-xs text-slate-500">(Simulated, resets on refresh)</span>
                    </label>
                  </div>
                </div>
              </fieldset>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-medium text-slate-900 dark:text-white">Danger Zone</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    This action is irreversible and will reset the application to its default state.
                </p>
                <div className="mt-4">
                    <button
                      onClick={handleDeleteAllDataClick}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete All Data
                    </button>
                </div>
              </div>
            </div>
        </div>
      </div>


      {/* Questionnaires Section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Questionnaires</h2>
          <div className="flex items-center space-x-2">
            <input type="file" ref={importInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <button
              onClick={handleImportClick}
              title="Import a questionnaire from a JSON file"
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              <UploadIcon className="w-5 h-5 mr-2" />
              Import
            </button>
            <button
              onClick={handleCreateNew}
              title="Create a new questionnaire from scratch"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionnaires.map((q) => (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{q.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{q.questions.length} questions</p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => handleExport(q)} className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Export Questionnaire as JSON">
                  <DownloadIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleEdit(q)} className="p-2 text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" title="Edit Questionnaire">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteQuestionnaireClick(q.id)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete Questionnaire">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Submitted Results</h2>
         <CandidateSearch
          results={results}
          questionnaires={questionnaires}
          certificateTemplate={certificateTemplate}
          renderActions={(result) => (
             <div className="flex justify-end items-center space-x-2">
                <button 
                  onClick={() => handleNotifyUser(result)}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  title="Notify user via email"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-1.5" />
                  Notify User
                </button>
                <button 
                  onClick={() => setShowSendModal(result)}
                  title="Proceed to payment to send result to a recruiter"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <SendIcon className="w-4 h-4 mr-1.5" />
                  Send to Recruiter
                </button>
             </div>
          )}
        />
      </div>

      {/* User Management Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <UserGroupIcon className="w-6 h-6 mr-3 text-slate-500 dark:text-slate-400" />
          User Management
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{`${user.firstName} ${user.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                        disabled={user.id === currentUser.id}
                        className="w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {USER_ROLES.map(role => (
                          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteUserClick(user.id)}
                        disabled={user.id === currentUser.id}
                        className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        title={user.id === currentUser.id ? "Cannot delete yourself" : "Delete User Account"}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Audit Log Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <ClockIcon className="w-6 h-6 mr-3 text-slate-500 dark:text-slate-400" />
          Admin Audit Log
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Action</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400" title={new Date(log.timestamp).toISOString()}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No admin actions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;