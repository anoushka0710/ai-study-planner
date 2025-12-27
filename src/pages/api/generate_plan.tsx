import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    const daysUntilExam = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const prompt = `
You are an expert AI study planner.
The current date (today) is ${today}.

Subjects: ${subjects}
Number of subjects: ${subjectsCount}
Exam date: ${examDate}
Study hours per day: ${hoursPerDay} hours
Total days until exam: ${daysUntilExam}

Revision days before exam: ${revisionDays}
Pomodoro duration: ${pomodoro} minutes
Rest days per week: ${restDays}

CRITICAL REQUIREMENTS:
1. Generate a timetable for ALL ${daysUntilExam} days (Day 1, Day 2, Day 3, ..., Day ${daysUntilExam})
2. For each non-rest day, fill with study tasks totaling approximately ${hoursPerDay * 60} minutes per day
3. Use the EXACT format: "Subject : Action (X min)" where X is the number of minutes
4. Do NOT mention topics or chapters
5. Use ONLY these actions: Study, Practice, Revision, Mock Test
6. Prioritize harder subjects
7. Rest days should have empty arrays []
8. Revision days should focus on Revision activities
9. Distribute subjects evenly across study days
10. Output ONLY valid JSON

EXAMPLE FORMAT (must include "min" in parentheses):
{
  "timetable": {
    "Day 1": ["Math : Study (120 min)", "Physics : Practice (60 min)", "Chemistry : Study (60 min)"],
    "Day 2": ["Math : Practice (90 min)", "Physics : Study (90 min)"],
    "Day 3": []
  },
  "revisionDays": ["Day ${daysUntilExam - revisionDays + 1}", "Day ${daysUntilExam}"],
  "restDays": ["Day 3", "Day 7"],
  "tips": ["Tip 1", "Tip 2"]
}

Generate a complete timetable for all ${daysUntilExam} days:
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


    const dateList = getDatesBetween(new Date(), new Date(examDate));

    const timetableByDate: Record<string, string[]> = {};

    Object.entries(plan.timetable).forEach(([dayKey, sessions], index) => {
      const date = dateList[index];
      if (date) {
        timetableByDate[date] = sessions as string[];
      }
    });

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
