import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MOTIVATIONAL_QUOTES = [
  "Small steps every day forge the path to massive breakthroughs.",
  "Consistency creates the momentum that intensity can never match.",
  "Build a life today that your future self will be proud to inherit.",
  "Do not work until you are tired; work until you are finished.",
];

export default function PlannerResult() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [timetableByDate, setTimetableByDate] = useState<Record<string, string[]>>({});
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [planName, setPlanName] = useState("My Study Plan");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "studyPlans", id as string));
      if (snap.exists()) {
        const data = snap.data();
        setTimetableByDate(data.timetableByDate || {});
        setQuote(
          MOTIVATIONAL_QUOTES[
            Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
          ]
        );
      }
      setLoading(false);
    };

    fetchPlan();
  }, [id]);

  const handleSave = async () => {
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "plans"), {
      name: planName,
      originalPlanId: id,
      timetableByDate,
      createdAt: serverTimestamp(),
    });

    setSaveStatus("Plan saved!");
    setShowSaveInput(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Loading your study plan...
      </div>
    );
  }

  /* ---------- helpers ---------- */

  const parseTasksBySubject = (tasks: string[]) => {
    const map: Record<string, string[]> = {};

    tasks.forEach((t) => {
      const [subject, rest] = t.split(" : ");
      if (!map[subject]) map[subject] = [];
      map[subject].push(rest);
    });

    return map;
  };

  const getTotalTime = (tasks: string[]) =>
    tasks.reduce((sum, t) => {
      const m = t.match(/\((\d+)m\)/);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);

  return (
    <div
      className="min-h-screen text-white p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.4)),url('/b1.jpg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Save */}
      <div className="max-w-6xl mx-auto flex justify-end mb-6">
        {!showSaveInput ? (
          <button
            onClick={() => setShowSaveInput(true)}
            className="bg-green-600 px-6 py-2 rounded-lg"
          >
            Save Plan
          </button>
        ) : (
          <div className="flex gap-3">
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="bg-white/10 px-3 py-2 rounded-lg"
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 px-5 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        )}
        {saveStatus && <span className="ml-4 text-green-400">{saveStatus}</span>}
      </div>

      <h1 className="text-4xl font-bold text-center mb-8">
        Your Study Plan
      </h1>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-purple-600/20 p-4 rounded-xl text-center italic">
          "{quote}"
        </div>
      </div>

      {/* ---------- DAY CARDS ---------- */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {Object.entries(timetableByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, tasks]) => {
            const isOpen = expandedDate === date;
            const grouped = parseTasksBySubject(tasks);
            const totalTime = getTotalTime(tasks);

            return (
              <motion.div
                key={date}
                layout
                onClick={() =>
                  setExpandedDate(isOpen ? null : date)
                }
                className="cursor-pointer rounded-2xl bg-white/15 backdrop-blur-xl p-6 border border-white/25 shadow-xl"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">
                    {new Date(date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <span className="text-sm text-purple-300">
                    ⏱ {Math.floor(totalTime / 60)}h {totalTime % 60}m
                  </span>
                </div>

                {/* COLLAPSED */}
                {!isOpen && (
                  <p className="text-white/70">
                    {tasks.slice(0, 2).join(" • ")}
                    {tasks.length > 2 && " ..."}
                  </p>
                )}

                {/* EXPANDED */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 mt-4"
                    >
                      {Object.entries(grouped).map(
                        ([subject, items]) => (
                          <div
                            key={subject}
                            className="bg-black/30 rounded-xl p-4"
                          >
                            <h3 className="text-lg font-bold mb-2">
                              {subject.toUpperCase()}
                            </h3>
                            <ul className="space-y-2">
                              {items.map((i, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between text-white/90"
                                >
                                  <span>{i.replace(/\(.*?\)/, "")}</span>
                                  <span className="text-purple-300">
                                    {i.match(/\(.*?\)/)?.[0]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
      </div>

      {user && (
        <div className="mt-12 text-center">
          <Link href="/my-plans">
            <button className="bg-purple-600 px-8 py-3 rounded-lg font-bold">
              My Plans
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
