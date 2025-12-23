import { useState } from "react";
import {useRouter} from "next/router";


export default function Planner() {
  const router=useRouter();
  // 🔹 State for form inputs
  const [subjectsCount, setSubjectsCount] = useState<number>(1);
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [revisionDays, setRevisionDays] = useState<number>(0);
  const [pomodoro, setPomodoro] = useState<number>(25);
  const [restDays, setRestDays] = useState<number>(0);

  // 🔹 State for result
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 THIS is where fetch() belongs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    setLoading(true);

    const res = await fetch("/api/generate_plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectsCount,
        subjects,
        examDate,
        hoursPerDay,
        difficulty,
        revisionDays,
        pomodoro,
        restDays,
      }),
    });

    const data = await res.json();
    // setPlan(data.plan);
    // setLoading(false);
    router.push(`/planner/${data.id}`);

  };

  return (
    <div className="page">
      <div className="form-box">
        <h1>Plan Your Session</h1>
        <p>Enter details to create your study plan</p>

        {/* 🔹 attach onSubmit here */}
        <form onSubmit={handleSubmit}>
          <div className="group">
            <label>No. of Subjects</label>
            <input
              type="number"
              min="1"
              value={subjectsCount}
              onChange={(e) => setSubjectsCount(Number(e.target.value))}
              required
            />
          </div>

          <div className="group">
            <label>Subjects (comma separated)</label>
            <input
              type="text"
              placeholder="Math, History, Science"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label>Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label>Hours per Day</label>
            <input
              type="number"
              min="1"
              max="16"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              required
            />
          </div>

          <div className="group">
            <label>Difficulty Level</label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            />
          </div>

          <div className="group">
            <label>Revision Days Before Exam</label>
            <input
              type="number"
              min="0"
              value={revisionDays}
              onChange={(e) => setRevisionDays(Number(e.target.value))}
            />
          </div>

          <div className="group">
            <label>Pomodoro Slot (minutes)</label>
            <input
              type="number"
              min="10"
              value={pomodoro}
              onChange={(e) => setPomodoro(Number(e.target.value))}
            />
          </div>

          <div className="group">
            <label>Rest Days per Week</label>
            <input
              type="number"
              min="0"
              max="7"
              value={restDays}
              onChange={(e) => setRestDays(Number(e.target.value))}
            />
          </div>

          <button className="submit" type="submit">
            {loading ? "Generating...": "Generate Schedule"}
          </button>
        </form>

        {/* 🔹 Display generated plan */}
        {plan && (
          <div className="result">
            <h2>Your Study Plan</h2>
            <pre>{plan}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
