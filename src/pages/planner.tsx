import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
export default function Planner() {
  const router = useRouter();
  const { user, login, logout, authloading } = useAuth();
  const [subjectsCount, setSubjectsCount] = useState<number>(1);
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);
  const [difficulties, setDifficulties] = useState<number[]>([]); // New: array for per-subject difficulties
  const [revisionDays, setRevisionDays] = useState<number>(0);
  const [pomodoro, setPomodoro] = useState<number>(25);
  const [restDays, setRestDays] = useState<number>(0);

  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to parse subjects into array
  const parsedSubjects = subjects.split(",").map((s) => s.trim()).filter((s) => s);

  // Update difficulties array when subjects change (reset to default 3 if length changes)
  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubjects(e.target.value);
    const newParsed = e.target.value.split(",").map((s) => s.trim()).filter((s) => s);
    if (newParsed.length !== difficulties.length) {
      setDifficulties(new Array(newParsed.length).fill(3)); // Default to medium difficulty
    }
  };

  // Update specific difficulty
  const handleDifficultyChange = (index: number, value: number) => {
    const newDifficulties = [...difficulties];
    newDifficulties[index] = value;
    setDifficulties(newDifficulties);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/generate_plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectsCount: parsedSubjects.length, // Use actual count from parsed
        subjects,
        examDate,
        hoursPerDay,
        difficulties, // New: send array
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
      className="page min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white p-4 md:p-8"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/b1.jpg')",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Auth Status - Integrated at the top with styling */}
      <div className="max-w-2xl mx-auto mb-8">
  {authloading ? (
    <p className="text-center text-white/80">Loading user...</p>
  ) : user ? (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-xl font-semibold">Welcome, {user.displayName}!</p>
      <div className="flex gap-4">
        <Link href="/my-plans">
          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-medium transition duration-200 shadow-md">
            My Plans
          </button>
        </Link>
        <button 
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-medium transition duration-200 shadow-md"
        >
          Logout
        </button>
      </div>
    </div>
  ) : (
    <button 
      onClick={login}
      className="block mx-auto bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-bold text-lg transition duration-200 shadow-lg"
    >
      Sign in with Google
    </button>
  )}
</div>

      <motion.div
        className="form-box max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">Plan Your Session</h1>
        <p className="text-center text-white/70 mb-8">Enter details to create your study plan</p>

        <form onSubmit={handleSubmit}>
          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <label className="block text-sm font-medium mb-1">No. of Subjects</label>
            <input
              type="number"
              min="1"
              value={subjectsCount}
              onChange={(e) => setSubjectsCount(Number(e.target.value))}
              required
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium mb-1">Subjects (comma separated)</label>
            <input
              type="text"
              placeholder="Math, History, Science"
              value={subjects}
              onChange={handleSubjectsChange}
              required
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          {/* Per-subject difficulty sliders */}
          {parsedSubjects.map((subject, index) => (
            <motion.div
              key={index}
              className="group mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="block text-sm font-medium mb-1">Difficulty Level for {subject}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={difficulties[index] || 3}
                onChange={(e) => handleDifficultyChange(index, Number(e.target.value))}
                className="w-full accent-purple-400"
              />
              <span className="block text-center text-white/80 mt-1">{difficulties[index] || 3}</span>
            </motion.div>
          ))}

          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium mb-1">Hours per Day</label>
            <input
              type="number"
              min="1"
              max="16"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              required
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium mb-1">Revision Days Before Exam</label>
            <input
              type="number"
              min="0"
              value={revisionDays}
              onChange={(e) => setRevisionDays(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium mb-1">Pomodoro Slot (minutes)</label>
            <input
              type="number"
              min="10"
              value={pomodoro}
              onChange={(e) => setPomodoro(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          <motion.div className="group mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium mb-1">Rest Days per Week</label>
            <input
              type="number"
              min="0"
              max="7"
              value={restDays}
              onChange={(e) => setRestDays(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>

          <motion.button
            className="submit w-full bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-white font-bold text-lg transition duration-200 shadow-md disabled:opacity-50"
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.04 } : {}}
            whileTap={!loading ? { scale: 0.96 } : {}}
            animate={loading ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ repeat: loading ? Infinity : 0, duration: 1 }}
          >
            {loading ? "Generating your plan..." : "Generate Schedule"}
          </motion.button>
        </form>

        {plan && (
          <motion.div
            className="result mt-12 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">Your Study Plan</h2>
            <pre className="text-white/80 whitespace-pre-wrap">{plan}</pre>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}