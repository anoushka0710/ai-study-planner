import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const MOTIVATIONAL_QUOTES = [
  "Small steps every day forge the path to massive breakthroughs.",
  "Consistency creates the momentum that intensity can never match.",
  "Build a life today that your future self will be proud to inherit.",
  "Chase the beauty of progress; leave the ghost of perfection behind.",
  "Dream without limits. Start without hesitation. Act without delay.",
  "Sacrifice the comfort of now for the brilliance of your future.",
  "Discipline is the ultimate act of self-love for your highest goals.",
  "Every ounce of daily effort compounds into a lifetime of success.",
  "Your vision is too valuable to be traded for temporary ease.",
  "Be relentless in your pursuit and unshakable in your commitment.",
  "You possess the strength to turn 'impossible' into your reality.",
  "Grit is the bridge between the dream in your heart and the reality in your hands."
  // Add more as needed
];

export default function PlannerResult() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDays, setOpenDays] = useState<string[]>([]);
  const [quote, setQuote] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [planName, setPlanName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "studyPlans", id as string));
      if (snap.exists()) {
        setPlan(snap.data().plan);
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
      }
      setLoading(false);
    };

    fetchPlan();
  }, [id]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus("Please sign in to save your plan.");
      return;
    }
    if (!planName.trim()) {
      setSaveStatus("Enter a name for your plan.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "plans"), {
        name: planName,
        originalPlanId: id, // Important for linking back
        plan: plan.timetable,
        tips: plan.tips || [],
        createdAt: serverTimestamp(),
      });
      setSaveStatus("Plan saved successfully! Check My Plans.");
      setShowSaveInput(false);
    } catch (error) {
      setSaveStatus("Failed to save. Try again.");
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-white text-2xl">Loading...</div>;
  if (!plan) return <div className="min-h-screen grid place-items-center text-white text-2xl">Plan not found.</div>;

  const groupTasks = (tasks: string[]) => {
    const grouped: any = {};
    tasks.forEach((task: string) => {
      const [subject, rest] = task.split(" : ");
      const match = rest.match(/(.+) \((\d+) min\)/);
      if (!match) return;
      const action = match[1].trim();
      const mins = parseInt(match[2]);

      if (!grouped[subject]) grouped[subject] = {};
      grouped[subject][action] = (grouped[subject][action] || 0) + mins;
    });
    return grouped;
  };

  const getIcon = (action: string) => {
    if (action.toLowerCase().includes("study")) return "📘";
    if (action.toLowerCase().includes("practice")) return "🟢";
    if (action.toLowerCase().includes("revision")) return "🟡";
    if (action.toLowerCase().includes("mock")) return "🔴";
    return "✦";
  };

  const calculateTotalMinutes = (grouped: any) => {
    return Object.values(grouped).reduce((total: number, actions: any) => {
      return total + Object.values(actions as any).reduce((sum: number, mins: any) => sum + mins, 0);
    }, 0);
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/b1.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Top Bar: Save Plan + My Plans Button */}
          <div className="flex justify-between items-center mb-10">
            <Link href="/my-plans">
              <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white font-bold transition shadow-lg">
                ← My Plans
              </button>
            </Link>

            <div className="flex items-center gap-4">
              {!showSaveInput ? (
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl text-white font-bold text-lg transition shadow-lg"
                >
                  Save Plan
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. JEE 2026 Plan"
                    className="bg-transparent text-white placeholder-white/50 outline-none w-64"
                  />
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveInput(false);
                      setSaveStatus("");
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {saveStatus && (
            <p className={`text-center mb-6 text-lg ${saveStatus.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {saveStatus}
            </p>
          )}

          {/* Title & Quote */}
          <h1 className="text-5xl font-bold text-center mb-10 drop-shadow-2xl">
            Your Study Plan
          </h1>

          {quote && (
            <div className="max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-800/40 backdrop-blur-lg border border-purple-500/30 rounded-2xl px-8 py-6 text-center shadow-2xl"
              >
                <p className="text-xl md:text-2xl italic text-purple-100 leading-relaxed">
                  "{quote}"
                </p>
              </motion.div>
            </div>
          )}

          {/* Timetable Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
  {Object.entries(plan.timetable as Record<string, string[]>)
    .sort(([a], [b]) => {
      const numA = Number(a.match(/\d+/)?.[0]) || 0;
      const numB = Number(b.match(/\d+/)?.[0]) || 0;
      return numA - numB;
    })
    .map(([day, tasks]) => {
      const grouped = groupTasks(tasks);
      const totalMinutes = calculateTotalMinutes(grouped);
      const hasContent = Object.keys(grouped).length > 0;

      return (
        <motion.div
          key={day}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
        >
                    <button
                      onClick={() => {
                        if (!hasContent) return;
                        setOpenDays(prev =>
                          prev.includes(day)
                            ? prev.filter(d => d !== day)
                            : [...prev, day]
                        );
                      }}
                      className={`w-full px-8 py-6 text-left transition-all ${
                        hasContent ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{day}</h2>
                        <div className="flex items-center gap-4">
                          <span className="text-purple-300 text-lg">
                            ⏱ {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                          </span>
                          {hasContent && (
                            <span className="text-2xl transition-transform duration-300">
                              {openDays.includes(day) ? '▼' : '▶'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {openDays.includes(day) && hasContent && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="px-8 pb-8 space-y-6"
                        >
                          {Object.entries(grouped as Record<string, Record<string, number>>).map(([subject, actions]) => (
                            <div
                              key={subject}
                              className="bg-black/30 rounded-2xl p-6 border border-white/10"
                            >
                              <h3 className="text-xl font-bold text-purple-200 mb-4 uppercase tracking-wider">
                                {subject}
                              </h3>
                              <ul className="space-y-3">
                                {Object.entries(actions).map(([action, mins]) => (
                                  <li key={action} className="flex justify-between items-center text-lg">
                                    <span className="flex items-center gap-3">
                                      <span className="text-2xl">{getIcon(action)}</span>
                                      <span>{action}</span>
                                    </span>
                                    <span className="text-purple-300 font-medium">{mins}m</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!hasContent && (
                      <div className="px-8 py-12 text-center">
                        <p className="text-white/50 italic text-lg">Rest / Light Day</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>

          {/* Tips */}
          {plan.tips && plan.tips.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-20">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
                <h3 className="text-3xl font-bold text-purple-200 mb-8 text-center">
                  Expert Study Tips
                </h3>
                <ul className="grid md:grid-cols-2 gap-6 text-lg">
                  {plan.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex gap-4 text-white/90">
                      <span className="text-purple-400 text-2xl">✦</span>
                      <span className="italic">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}