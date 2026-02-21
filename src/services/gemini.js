
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates text content using the Gemini model.
 * @param {string} prompt - The user's prompt.
 * @param {object} options - Generation options (optional).
 * @returns {Promise<string>} The generated text.
 */
export const generateText = async (prompt, options = {}) => {
    try {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
        }

        // Use gemini-pro (now aka gemini-1.5-flash or similar depending on version, but gemini-pro is a safe alias usually)
        // Or use the model specified in options
        const modelName = options.model || "gemini-pro";
        const model = genAI.getGenerativeModel({ model: modelName });

        const generationConfig = {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 2048,
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });

        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error generating text with Gemini:", error);
        throw error;
    }
};

/**
 * Generates content from text and images using the Gemini model.
 * @param {string} prompt - The user's prompt.
 * @param {File[]} images - Array of image files.
 * @param {object} options - Generation options (optional).
 * @returns {Promise<string>} The generated text response.
 */
export const generateVisionContent = async (prompt, images, options = {}) => {
    try {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing.");
        }

        const modelName = options.model || "gemini-pro-vision"; // Or gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: modelName });

        const imageParts = await Promise.all(
            images.map(async (file) => {
                return {
                    inlineData: {
                        data: await fileToGenerativePart(file),
                        mimeType: file.type,
                    },
                };
            })
        );

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error generating vision content with Gemini:", error);
        throw error;
    }
};

// Helper to convert file to base64
async function fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
