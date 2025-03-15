import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";

// Load environment variables from .env file
// dotenv.config();
// import.meta.env.
const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash",
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const parser = new JsonOutputParser();

export async function generateQuiz(analysisContent) {
    if (!analysisContent) {
        throw new Error("No analysis content provided");
    }
    
    const prompt = `
    You are CodeEd Assistant, an educational code improvement tool designed specifically for 
    React developers. Your goal is to analyze React code and provide helpful, educational feedback that helps developers improve their skills.
    Blog Content:
    ${analysisContent}
    Based on the code analysis, generate 3 multiple-choice quiz questions that:
    - Test understanding of the key React concepts identified in the analysis
    - Include 4 possible answers per question (only one correct)
    - Provide brief explanations for why each answer is correct/incorrect
    - Range from basic understanding to application of concepts
    - Are directly relevant to the improvement opportunities in their code
    
    Create a quiz in the following JSON format:
    {
        "quizzes": [
            {
                "question": "Specific question about the code analysis",
                "options": [
                    "First option",
                    "Second option",
                    "Third option",
                    "Fourth option"
                ],
                "correctAnswer": "The exact text of the correct option",
                "explanation": "Explanation why this answer is correct"
            }
        ]
    }

    `;

    try {
        const response = await model.call([{ role: "user", content: prompt }]);
        
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                const parsed = JSON.parse(jsonStr);
                if (parsed && parsed.quizzes) {
                    return parsed;
                }
            }
            
            // If no valid JSON found, create a structured response
            return {
                quizzes: [{
                    question: "What is the main focus of this code analysis?",
                    options: [
                        "Code quality and best practices",
                        "Database optimization",
                        "Network security",
                        "UI design patterns"
                    ],
                    correctAnswer: "Code quality and best practices",
                    explanation: "The analysis primarily focuses on code quality, React best practices, and potential improvements."
                }]
            };
        } catch (parseError) {
            console.error("Error parsing quiz response:", parseError);
            throw new Error("Failed to generate quiz from analysis");
        }
    } catch (error) {
        console.error("Error in generateQuiz:", error);
        throw new Error("Failed to generate quiz: " + error.message);
    }
}

