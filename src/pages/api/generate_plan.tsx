import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing from .env.local");
    return res.status(500).json({ error: "Server configuration error: Missing API Key" });
  }

  try {
    const {
      subjectsCount,
      subjects,
      examDate,
      hoursPerDay,
      difficulty,
      revisionDays,
      pomodoro,
      restDays,
    } = req.body;

    // 1. Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);

    // 2. Use the stable model name (gemini-1.5-flash)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const today = new Date().toISOString().split('T')[0];
const prompt = `
You are an expert AI study planner.
The current date (today) is ${today}.

Subjects: ${subjects}
Number of subjects: ${subjectsCount}
Exam date: ${examDate}
Study hours per day: ${hoursPerDay}
Difficulty level (1-5): ${difficulty}
Revision days before exam: ${revisionDays}
Pomodoro duration: ${pomodoro} minutes
Rest days per week: ${restDays}

STRICT RULES:
- Do NOT mention any specific topic names
- Do NOT mention chapter names or concepts
- Use ONLY generic actions like:
  "Study", "Practice", "Revision", "Mock Test"
- Divide study time realistically among subjects
- Respect rest days and revision days
- Use Pomodoro duration to split study sessions
- Keep the plan practical and balanced
- Do NOT add explanations, notes, or extra text

OUTPUT FORMAT:
Return ONLY valid JSON.
No markdown.
No comments.

JSON structure:
{
  "timetable": {
    "Day 1": ["Subject : Action (time)"],
    "Day 2": ["Subject : Action (time)"]
  },
  "revisionDays": ["Day X", "Day Y"],
  "restDays": ["Day Z"],
  "tips": ["Short tip 1", "Short tip 2"]
}
`;


    // 3. Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const plan = JSON.parse(response.text());

    if (!plan) {
      throw new Error("Empty response from AI");
    }
 
const docRef = await addDoc(collection(db, "studyPlans"), {
  plan,
  createdAt: serverTimestamp(),
  meta: {
    subjects,
    examDate,
    hoursPerDay,
  },
});

res.status(200).json({ id: docRef.id });
    
  } catch (error: any) {
    // Log the full error to your terminal for debugging
    console.error("Gemini API Error:", error);

    res.status(500).json({ 
      error: "Failed to generate study plan", 
      details: error.message 
    });
  }
}