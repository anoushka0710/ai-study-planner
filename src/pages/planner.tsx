import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function Planner() {
  const router = useRouter();

  const [subjectsCount, setSubjectsCount] = useState<number>(1);
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [revisionDays, setRevisionDays] = useState<number>(0);
  const [pomodoro, setPomodoro] = useState<number>(25);
  const [restDays, setRestDays] = useState<number>(0);

  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/generate_plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    router.push(`/planner/${data.id}`);
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="form-box"
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1>Plan Your Session</h1>
        <p>Enter details to create your study plan</p>

        <form onSubmit={handleSubmit}>
          <motion.div
            className="group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label>No. of Subjects</label>
            <input
              type="number"
              min="1"
              value={subjectsCount}
              onChange={(e) => setSubjectsCount(Number(e.target.value))}
              required
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Subjects (comma separated)</label>
            <input
              type="text"
              placeholder="Math, History, Science"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              required
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Target Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Hours per Day</label>
            <input
              type="number"
              min="1"
              max="16"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              required
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Difficulty Level</label>
            <input
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Revision Days Before Exam</label>
            <input
              type="number"
              min="0"
              value={revisionDays}
              onChange={(e) => setRevisionDays(Number(e.target.value))}
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Pomodoro Slot (minutes)</label>
            <input
              type="number"
              min="10"
              value={pomodoro}
              onChange={(e) => setPomodoro(Number(e.target.value))}
            />
          </motion.div>

          <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label>Rest Days per Week</label>
            <input
              type="number"
              min="0"
              max="7"
              value={restDays}
              onChange={(e) => setRestDays(Number(e.target.value))}
            />
          </motion.div>

          <motion.button
            className="submit"
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            animate={loading ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ repeat: loading ? Infinity : 0, duration: 1 }}
          >
            {loading ? "Generating your plan..." : "Generate Schedule"}
          </motion.button>
        </form>

        {plan && (
          <motion.div
            className="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>Your Study Plan</h2>
            <pre>{plan}</pre>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
