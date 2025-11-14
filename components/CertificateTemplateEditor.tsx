import React, { useState, useRef } from 'react';
import { CertificateTemplate, SurveyResult, Questionnaire } from '../types';
import { ImageIcon, SignatureIcon, TrashIcon } from './icons';
import SurveyCertificate from './SurveyCertificate';

interface CertificateTemplateEditorProps {
    template: CertificateTemplate;
    onSave: (template: CertificateTemplate) => void;
}

const previewQuestionnaire: Questionnaire = {
    id: 'preview-q1',
    title: 'Sample Role Readiness',
    questions: [
        { id: 'pq1', text: 'Q1', trait: 'Leadership', options: [{ text: 'A', score: 5 }] },
        { id: 'pq2', text: 'Q2', trait: 'Teamwork', options: [{ text: 'A', score: 5 }] },
        { id: 'pq3', text: 'Q3', trait: 'Problem Solving', options: [{ text: 'A', score: 5 }] },
        { id: 'pq4', text: 'Q4', trait: 'Adaptability', options: [{ text: 'A', score: 5 }] },
    ],
};

const previewResult: SurveyResult = {
    id: 'preview-res1',
    userId: 'preview-user',
    userName: 'Jane Doe',
    questionnaireId: 'preview-q1',
    questionnaireTitle: 'Sample Role Readiness',
    answers: [
        { questionId: 'pq1', score: 4 },
        { questionId: 'pq2', score: 5 },
        { questionId: 'pq3', score: 3 },
        { questionId: 'pq4', score: 4 },
    ],
    totalScore: 16,
    maxScore: 20,
    completedAt: new Date().toISOString(),
};


const CertificateTemplateEditor: React.FC<CertificateTemplateEditorProps> = ({ template, onSave }) => {
    const [editedTemplate, setEditedTemplate] = useState<CertificateTemplate>(template);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const handleToggle = (key: keyof CertificateTemplate) => {
        setEditedTemplate(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedTemplate(prev => ({ ...prev, customMessage: e.target.value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedTemplate(prev => ({
                    ...prev,
                    [type === 'logo' ? 'logoUrl' : 'signatureUrl']: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (type: 'logo' | 'signature') => {
        setEditedTemplate(prev => ({
            ...prev,
            [type === 'logo' ? 'logoUrl' : 'signatureUrl']: null
        }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedTemplate);
    };

    const ImageUpload: React.FC<{ type: 'logo' | 'signature' }> = ({ type }) => {
        const url = type === 'logo' ? editedTemplate.logoUrl : editedTemplate.signatureUrl;
        const ref = type === 'logo' ? logoInputRef : signatureInputRef;
        const Icon = type === 'logo' ? ImageIcon : SignatureIcon;
        const label = type === 'logo' ? 'Company Logo' : 'Signature';

        return (
            <div>
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-32 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        {url ? (
                            <img src={url} alt={label} className={`max-h-14 ${type === 'logo' ? 'w-auto' : 'w-28'}`} />
                        ) : (
                            <Icon className="h-8 w-8 text-slate-400" />
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="file" accept="image/*" ref={ref} onChange={(e) => handleFileChange(e, type)} className="hidden" />
                        <button type="button" onClick={() => ref.current?.click()} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500">
                            Change
                        </button>
                        {url && (
                             <button type="button" onClick={() => handleRemoveImage(type)} className="p-2 text-slate-500 hover:text-red-600">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 items-start">
            {/* Column 1: Editor Form */}
            <form onSubmit={handleSubmit} className="space-y-6 lg:sticky lg:top-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <fieldset className="space-y-3">
                        <legend className="text-base font-medium text-slate-900 dark:text-white">Visible Sections</legend>
                        {([
                            { key: 'showLogo', label: 'Show Company Logo' },
                            { key: 'showOverallScore', label: 'Show Overall Score' },
                            { key: 'showTraitScores', label: 'Show Trait Scores Breakdown' },
                            { key: 'showSignature', label: 'Show Signature' },
                            { key: 'showWatermark', label: 'Show Watermark' },
                        ] as { key: keyof CertificateTemplate, label: string }[]).map(({ key, label }) => (
                            <div key={key} className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id={key}
                                        name={key}
                                        type="checkbox"
                                        checked={!!editedTemplate[key]}
                                        onChange={() => handleToggle(key)}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded dark:bg-slate-600 dark:border-slate-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={key} className="font-medium text-slate-700 dark:text-slate-300">{label}</label>
                                </div>
                            </div>
                        ))}
                    </fieldset>

                    <div className="space-y-4">
                       <ImageUpload type="logo" />
                       <ImageUpload type="signature" />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="customMessage" className="block text-base font-medium text-slate-900 dark:text-white">Custom Message</label>
                    <textarea
                        id="customMessage"
                        rows={3}
                        value={editedTemplate.customMessage}
                        onChange={handleTextChange}
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                        placeholder="e.g., Congratulations on your achievement!"
                    />
                </div>

                <div>
                    <label htmlFor="watermarkText" className="block text-base font-medium text-slate-900 dark:text-white">Watermark Text</label>
                    <input
                        id="watermarkText"
                        type="text"
                        value={editedTemplate.watermarkText || ''}
                        onChange={(e) => setEditedTemplate(prev => ({ ...prev, watermarkText: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50"
                        placeholder="e.g., CONFIDENTIAL"
                        disabled={!editedTemplate.showWatermark}
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Template
                    </button>
                </div>
            </form>

            {/* Column 2: Live Preview */}
            <div>
                 <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Live Preview</h3>
                 <div className="relative h-[40rem] sm:h-[48rem] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 transform scale-[0.4] sm:scale-[0.5] origin-top">
                        <div className="w-[896px]"> {/* max-w-4xl is 56rem = 896px */}
                           <SurveyCertificate
                                result={previewResult}
                                questionnaire={previewQuestionnaire}
                                template={editedTemplate}
                            />
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    )
};

export default CertificateTemplateEditor;