import React, { useState, useEffect } from 'react';
import { Questionnaire, Question, behavioralTraits } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon } from './icons';
import { LIKERT_OPTIONS } from '../constants';
import { generateSurveyQuestions, hasApiKey } from '../services/geminiService';

interface QuestionnaireEditorProps {
  questionnaire: Questionnaire | null;
  onSave: (questionnaire: Questionnaire) => void;
  onClose: () => void;
}

const QuestionnaireEditor: React.FC<QuestionnaireEditorProps> = ({ questionnaire, onSave, onClose }) => {
  const [editedQuestionnaire, setEditedQuestionnaire] = useState<Questionnaire>(
    questionnaire || { id: `q-${Date.now()}`, title: '', questions: [] }
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const isApiKeyAvailable = hasApiKey();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedQuestionnaire({ ...editedQuestionnaire, title: e.target.value });
  };

  const updateQuestion = (index: number, updatedQuestion: Partial<Question>) => {
    const newQuestions = [...editedQuestionnaire.questions];
    newQuestions[index] = { ...newQuestions[index], ...updatedQuestion };
    setEditedQuestionnaire({ ...editedQuestionnaire, questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `qt-${Date.now()}`,
      text: '',
      trait: behavioralTraits[0],
      behavior: '',
      options: [...LIKERT_OPTIONS], // Start with default editable options
    };
    setEditedQuestionnaire({ ...editedQuestionnaire, questions: [...editedQuestionnaire.questions, newQuestion] });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = editedQuestionnaire.questions.filter((_, i) => i !== index);
    setEditedQuestionnaire({ ...editedQuestionnaire, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...editedQuestionnaire.questions];
    newQuestions[questionIndex].options.push({ text: '', score: 0 });
    setEditedQuestionnaire({ ...editedQuestionnaire, questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...editedQuestionnaire.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setEditedQuestionnaire({ ...editedQuestionnaire, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: 'text' | 'score', value: string) => {
    const newQuestions = [...editedQuestionnaire.questions];
    const newOptions = [...newQuestions[questionIndex].options];
    const updatedOption = { ...newOptions[optionIndex] };

    if (field === 'text') {
      updatedOption.text = value;
    } else {
      updatedOption.score = parseInt(value, 10) || 0;
    }
    
    newOptions[optionIndex] = updatedOption;
    newQuestions[questionIndex].options = newOptions;
    setEditedQuestionnaire({ ...editedQuestionnaire, questions: newQuestions });
  };

  const handleGenerateQuestions = async () => {
    const selectedTraits: string[] = Array.from(new Set(editedQuestionnaire.questions.map(q => q.trait).filter(Boolean)));
    if (!editedQuestionnaire.title) {
        alert("Please enter a questionnaire title first.");
        return;
    }
    if (selectedTraits.length === 0) {
        alert("Please add at least one question manually to define the traits you want to generate for.");
        return;
    }

    setIsGenerating(true);
    try {
        const generated = await generateSurveyQuestions(editedQuestionnaire.title, selectedTraits, 5);
        const newQuestions: Question[] = generated.map(q => ({
            ...q,
            id: `qt-${Date.now()}-${Math.random()}`,
            options: [...LIKERT_OPTIONS],
            behavior: '',
        }));
        setEditedQuestionnaire(prev => ({ ...prev, questions: [...prev.questions, ...newQuestions] }));
    } catch (error) {
        console.error(error);
        alert((error as Error).message);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedQuestionnaire);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl my-8">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{questionnaire ? 'Edit' : 'Create'} Questionnaire</h2>
            <input
              type="text"
              value={editedQuestionnaire.title}
              onChange={handleTitleChange}
              placeholder="Questionnaire Title"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>

          <div className="px-6 py-4 border-t border-b border-slate-200 dark:border-slate-700 max-h-[60vh] overflow-y-auto">
             {editedQuestionnaire.questions.map((q, qIndex) => (
                <div key={q.id || qIndex} className="p-4 mb-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-start space-x-4">
                        <span className="text-sm font-bold text-slate-500 mt-2">{qIndex + 1}</span>
                        <div className="flex-grow space-y-3">
                            <textarea
                                value={q.text}
                                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                                placeholder="Question Text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                rows={2}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <select
                                    value={q.trait}
                                    onChange={(e) => updateQuestion(qIndex, { trait: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                >
                                {behavioralTraits.map(trait => (
                                    <option key={trait} value={trait}>{trait}</option>
                                ))}
                                </select>
                                <input
                                    type="text"
                                    value={q.behavior || ''}
                                    onChange={(e) => updateQuestion(qIndex, { behavior: e.target.value })}
                                    placeholder="Specific Behavior (optional)"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
                                />
                            </div>
                            <div className="pt-2">
                                <h4 className="text-sm font-semibold mb-2">Answer Options & Scoring</h4>
                                <div className="space-y-2">
                                    {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'text', e.target.value)}
                                                placeholder="Option Text"
                                                className="flex-grow px-2 py-1 border border-slate-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600"
                                                required
                                            />
                                            <input
                                                type="number"
                                                value={opt.score}
                                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'score', e.target.value)}
                                                placeholder="Score"
                                                className="w-20 px-2 py-1 border border-slate-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600"
                                                required
                                            />
                                            <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="p-1 text-slate-400 hover:text-red-500">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={() => addOption(qIndex)} className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                                    + Add Option
                                </button>
                            </div>
                        </div>
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            ))}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between items-center space-y-2 sm:space-y-0">
                <button
                type="button"
                onClick={addQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-dashed border-slate-400 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
                >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Question
                </button>
                {isApiKeyAvailable && (
                    <button
                        type="button"
                        onClick={handleGenerateQuestions}
                        disabled={isGenerating}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                )}
            </div>
          </div>

          <div className="p-6 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Questionnaire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionnaireEditor;