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
  const [difficulties, setDifficulties] = useState<number[]>([]);
  const [revisionDays, setRevisionDays] = useState<number>(0);
  const [pomodoro, setPomodoro] = useState<number>(25);
  const [restDays, setRestDays] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const parsedSubjects = subjects
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubjects(e.target.value);
    const newParsed = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (newParsed.length !== difficulties.length) {
      setDifficulties(new Array(newParsed.length).fill(3));
    }
  };

  const handleDifficultyChange = (index: number, value: number) => {
    const copy = [...difficulties];
    copy[index] = value;
    setDifficulties(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/generate_plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectsCount: parsedSubjects.length,
        subjects,
        examDate,
        hoursPerDay,
        difficulties,
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
      className="min-h-screen text-white p-4 md:p-8"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url('/b1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-2xl mx-auto mb-8">
        {authloading ? (
          <p className="text-center text-white/80">Loading user...</p>
        ) : user ? (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xl font-semibold">
              Welcome, {user.displayName}!
            </p>

            <div className="flex gap-4">
              <Link href="/my-plans">
                <motion.button
                  whileHover={{
                    scale: 1.06,
                    boxShadow: "0px 0px 20px rgba(168,85,247,0.9)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 px-6 py-2 rounded-lg font-medium"
                >
                  My Plans
                </motion.button>
              </Link>

              <motion.button
                onClick={logout}
                whileHover={{
                  scale: 1.06,
                  boxShadow: "0px 0px 20px rgba(239,68,68,0.9)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 px-6 py-2 rounded-lg font-medium"
              >
                Logout
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={login}
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 0px 24px rgba(59,130,246,1)",
            }}
            whileTap={{ scale: 0.95 }}
            className="block mx-auto bg-blue-600 px-8 py-3 rounded-xl font-bold text-lg"
          >
            Sign in with Google
          </motion.button>
        )}
      </div>

      <motion.div
        className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Plan Your Session
        </h1>
        <p className="text-center text-white/70 mb-8">
          Enter details to create your study plan
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">
            No. of Subjects
          </label>
          <input
            type="number"
            min="1"
            value={subjectsCount}
            onChange={(e) => setSubjectsCount(Number(e.target.value))}
            className="w-full mb-6 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <label className="block mb-2 text-sm font-medium">
            Subjects (comma separated)
          </label>
          <input
            type="text"
            placeholder="Math, Physics, Social"
            value={subjects}
            onChange={handleSubjectsChange}
            className="w-full mb-6 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          {parsedSubjects.map((s, i) => (
            <div key={i} className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Difficulty Level for {s}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={difficulties[i] || 3}
                onChange={(e) =>
                  handleDifficultyChange(i, Number(e.target.value))
                }
                className="w-full accent-purple-400"
              />
            </div>
          ))}

          <label className="block mb-2 text-sm font-medium">
            Target Date
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full mb-6 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <label className="block mb-2 text-sm font-medium">
            Hours per Day
          </label>
          <input
            type="number"
            min="1"
            max="16"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full mb-6 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <label className="block mb-2 text-sm font-medium">
            Revision Days Before Exam
          </label>
          <input
            type="number"
            min="0"
            value={revisionDays}
            onChange={(e) => setRevisionDays(Number(e.target.value))}
            className="w-full mb-6 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <label className="block mb-2 text-sm font-medium">
            Pomodoro Slot (minutes)
          </label>
          <input
            type="number"
            min="10"
            value={pomodoro}
            onChange={(e) => setPomodoro(Number(e.target.value))}
            className="w-full mb-6 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <label className="block mb-2 text-sm font-medium">
            Rest Days per Week
          </label>
          <input
            type="number"
            min="0"
            max="7"
            value={restDays}
            onChange={(e) => setRestDays(Number(e.target.value))}
            className="w-full mb-8 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.06 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            className="w-full bg-purple-600 py-4 rounded-xl font-bold text-lg shadow-lg"
          >
            {loading ? "Generating your plan..." : "Generate Schedule"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
