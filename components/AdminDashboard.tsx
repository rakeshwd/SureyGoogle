import React, { useState, useRef } from 'react';
import { Questionnaire, SurveyResult, CertificateTemplate, AuditLog, User, USER_ROLES } from '../types';
import { PencilIcon, PlusIcon, SendIcon, TrashIcon, SpinnerIcon, CheckCircleIcon, LogoutIcon, EnvelopeIcon, UploadIcon, DownloadIcon, ClockIcon, UserGroupIcon } from './icons';
import QuestionnaireEditor from './QuestionnaireEditor';
import CertificateTemplateEditor from './CertificateTemplateEditor';
import CandidateSearch from './CandidateSearch';

interface AdminDashboardProps {
  questionnaires: Questionnaire[];
  results: SurveyResult[];
  onSave: (questionnaire: Questionnaire) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onShowNotification: (message: string) => void;
  certificateTemplate: CertificateTemplate;
  onSaveCertificateTemplate: (template: CertificateTemplate) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, details: string) => void;
  allUsers: User[];
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ questionnaires, results, onSave, onDelete, onLogout, onShowNotification, certificateTemplate, onSaveCertificateTemplate, auditLogs, onAddAuditLog, allUsers, currentUser, onUpdateUser, onDeleteUser }) => {
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState<SurveyResult | null>(null);
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const importInputRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteClick = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        onDeleteUser(userId);
    }
  };

  const renderModalContent = () => {
    if (paymentStatus === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center h-48">
                <SpinnerIcon className="h-12 w-12 text-indigo-600"/>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                required
              />
              <div className="flex justify-end space-x-3">
                 <button
                  type="button"
                  onClick={() => setShowSendModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
        <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
            <LogoutIcon className="h-5 w-5" />
            <span>Logout</span>
        </button>
      </div>

      {/* Certificate Template Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Certificate Template</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <CertificateTemplateEditor
                template={certificateTemplate}
                onSave={onSaveCertificateTemplate}
            />
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
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              <UploadIcon className="w-5 h-5 mr-2" />
              Import
            </button>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                <button onClick={() => handleExport(q)} className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Export">
                  <DownloadIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleEdit(q)} className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(q.id)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
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
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  title="Notify user via email"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-1.5" />
                  Notify User
                </button>
                <button 
                  onClick={() => setShowSendModal(result)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                        className="w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {USER_ROLES.map(role => (
                          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={user.id === currentUser.id}
                        className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        title={user.id === currentUser.id ? "Cannot delete yourself" : "Delete user"}
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