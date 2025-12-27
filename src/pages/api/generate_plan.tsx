import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/* 🔹 NEW helper (small & safe) */
function getDatesBetween(start: Date, end: Date) {
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing");
    return res.status(500).json({ error: "Missing API Key" });
  }

  try {
    const {
      subjectsCount,
      subjects,
      examDate,
      hoursPerDay,
      difficulties,
      revisionDays,
      pomodoro,
      restDays,
    } = req.body;

    const parsedSubjects = subjects
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const today = new Date().toISOString().split("T")[0];

    const prompt = `
You are an expert AI study planner.
The current date (today) is ${today}.

Subjects: ${subjects}
Number of subjects: ${subjectsCount}
Exam date: ${examDate}
Study hours per day: ${hoursPerDay}

Revision days before exam: ${revisionDays}
Pomodoro duration: ${pomodoro} minutes
Rest days per week: ${restDays}

STRICT RULES:
- Do NOT mention topics or chapters
- Use ONLY: Study, Practice, Revision, Mock Test
- Prioritize harder subjects
- Respect rest & revision days
- Output ONLY valid JSON

FORMAT:
{
  "timetable": {
    "Day 1": ["Subject : Action (time)"]
  },
  "revisionDays": ["Day X"],
  "restDays": ["Day Y"],
  "tips": ["Tip"]
}
`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();

    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }

    const plan = JSON.parse(rawText);
    if (!plan?.timetable) throw new Error("Invalid AI response");

    /* 🔹 NEW LOGIC (THIS IS THE CORE CHANGE) */

    const dateList = getDatesBetween(new Date(), new Date(examDate));

    const timetableByDate: Record<string, string[]> = {};

    Object.entries(plan.timetable).forEach(([dayKey, sessions], index) => {
      const date = dateList[index];
      if (date) {
        timetableByDate[date] = sessions as string[];
      }
    });

    /* 🔹 SAVE BOTH VERSIONS (SAFE) */
    const docRef = await addDoc(collection(db, "studyPlans"), {
      plan,
      timetableByDate,
      createdAt: serverTimestamp(),
      meta: {
        subjects,
        examDate,
        hoursPerDay,
        difficulties,
      },
    });

    res.status(200).json({ id: docRef.id });
  } catch (error: any) {
    if (error.status === 429) {
      return res.status(429).json({
        error: "Daily AI limit reached. Please try again later.",
      });
    }

    console.error("Plan generation error:", error);
    return res.status(500).json({ error: "Failed to generate study plan" });
  }
}
