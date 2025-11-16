
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';
import { LIKERT_OPTIONS } from '../constants';

const API_KEY = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        text: { 
            type: Type.STRING, 
            description: "The question text, phrased from a first-person perspective (e.g., 'I enjoy...')." 
        },
        trait: { 
            type: Type.STRING, 
            description: "The behavioral trait this question assesses."
        },
    },
    required: ["text", "trait"],
};

const surveySchema = {
    type: Type.ARRAY,
    items: questionSchema,
};

export const generateSurveyQuestions = async (title: string, traits: string[], count: number): Promise<Omit<Question, 'id' | 'options'>[]> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }

    const prompt = `
        Generate a list of ${count} behavioral survey questions for a questionnaire titled "${title}".
        The survey is for job seekers.
        The questions should assess the following behavioral traits: ${traits.join(', ')}.
        Each question must be phrased from a first-person perspective (e.g., "I am comfortable...", "I prefer...").
        Ensure the questions are distinct and relevant to a professional work environment.
        Distribute the questions evenly among the specified traits.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: surveySchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!Array.isArray(parsedResponse)) {
            throw new Error("AI response is not in the expected array format.");
        }
        
        return parsedResponse;

    } catch (error) {
        console.error("Error generating survey questions with Gemini:", error);
        throw new Error("Failed to generate questions. Please check the console for details.");
    }
};

export const hasApiKey = (): boolean => !!API_KEY;