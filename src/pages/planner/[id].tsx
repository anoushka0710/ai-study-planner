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
  
  // State for Checklist and completion popup
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [showHooray, setShowHooray] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id || id === 'undefined' || typeof id !== 'string') {
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "studyPlans", id));
      if (snap.exists()) {
        const planData = snap.data().plan;
        setPlan(planData);
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
        
        // Load completed tasks from localStorage
        const storageKey = `completedTasks_${id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCompletedTasks(parsed);
          } catch (e) {
            console.error("Error loading completed tasks:", e);
          }
        }
      }
      setLoading(false);
    };

    fetchPlan();
  }, [router.isReady, id]);

  const toggleTask = (day: string, subject: string, action: string) => {
    if (!id || typeof id !== 'string') return;
    
    const taskId = `${day}-${subject}-${action}`;
    setCompletedTasks(prev => {
      const newState = { ...prev, [taskId]: !prev[taskId] };
      checkDayCompletion(day, newState);
      
      // Save to localStorage
      const storageKey = `completedTasks_${id}`;
      localStorage.setItem(storageKey, JSON.stringify(newState));
      
      return newState;
    });
  };

  const checkDayCompletion = (day: string, currentTasks: Record<string, boolean>) => {
    const tasks = plan.timetable[day];
    const grouped = groupTasks(tasks);
    
    let allDone = true;
    let hasTasks = false;

    Object.entries(grouped).forEach(([subject, actions]) => {
      Object.keys(actions).forEach(action => {
        hasTasks = true;
        if (!currentTasks[`${day}-${subject}-${action}`]) {
          allDone = false;
        }
      });
    });

    if (hasTasks && allDone) {
      setShowHooray(true);
      setTimeout(() => setShowHooray(false), 4000); 
    }
  };

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
      if (typeof id !== "string") {
        setSaveStatus("Invalid plan ID. Please refresh and try again.");
        return;
      }
      await addDoc(collection(db, "users", user.uid, "plans"), {
        name: planName,
        originalPlanId: id,
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

  const groupTasks = (tasks: string[]) => {
    const grouped: Record<string, Record<string, number>> = {};
    if (!tasks || !Array.isArray(tasks)) return grouped;
    
    tasks.forEach((task: string) => {
      if (!task || typeof task !== 'string') return;
      const parts = task.split(" : ");
      if (parts.length < 2) return;
      const subject = parts[0].trim();
      const rest = parts.slice(1).join(" : ");
      const match = rest.match(/(.+?)\s*\((\d+)\s*(?:min|minutes?)?\)/i);
      if (!match) return;
      const action = match[1].trim();
      const mins = parseInt(match[2]);
      if (isNaN(mins) || mins <= 0) return;

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

  const calculateTotalMinutes = (grouped: Record<string, Record<string, number>>) => {
    return Object.values(grouped).reduce((total, actions) => {
      return total + Object.values(actions).reduce((sum, mins) => sum + mins, 0);
    }, 0);
  };

  // --- NEW PROGRESS TRACKING LOGIC ---
  const calculateProgress = () => {
    if (!plan || !plan.timetable) return 0;
    let totalTasks = 0;
    let doneTasks = 0;

    Object.entries(plan.timetable).forEach(([day, tasks]: any) => {
      const grouped = groupTasks(tasks);
      Object.entries(grouped).forEach(([subject, actions]) => {
        Object.keys(actions).forEach(action => {
          totalTasks++;
          if (completedTasks[`${day}-${subject}-${action}`]) {
            doneTasks++;
          }
        });
      });
    });

    return totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-white text-2xl">Loading...</div>;
  if (!plan) return <div className="min-h-screen grid place-items-center text-white text-2xl">Plan not found.</div>;

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center text-white relative"
      style={{ backgroundImage: "url('/b1.jpg')" }}
    >
      {/* FIXED HOORAY POPUP */}
      <AnimatePresence>
        {showHooray && (
          <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-start pt-10">
            <motion.div 
              initial={{ opacity: 0, y: -100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              className="bg-gradient-to-r from-purple-500 to-emerald-600 text-white px-10 py-5 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.5)] font-black text-2xl border-2 border-white/50 backdrop-blur-md pointer-events-auto"
            >
              🎉 Hooray! You completed all tasks for the day! 🚀
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Top Bar */}
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

          {/* NEW PROGRESS TRACKER UI */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-purple-200">Course Progress</h3>
                  <p className="text-white/50 text-sm">Real-time tracking of your journey</p>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-purple-400 drop-shadow-lg">
                    {calculateProgress()}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-black/40 h-5 rounded-full overflow-hidden border border-white/10 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
            {plan.timetable ? Object.entries(plan.timetable as Record<string, string[]>)
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
                          {Object.entries(grouped).map(([subject, actions]: [string, Record<string, number>]) => (
                            <div
                              key={subject}
                              className="bg-black/30 rounded-2xl p-6 border border-white/10"
                            >
                              <h3 className="text-xl font-bold text-purple-200 mb-4 uppercase tracking-wider">
                                {subject}
                              </h3>
                              <ul className="space-y-3">
                                {Object.entries(actions).map(([action, mins]) => {
                                  const isChecked = completedTasks[`${day}-${subject}-${action}`];
                                  return (
                                    <li key={action} className="flex justify-between items-center text-lg">
                                      <div className="flex items-center gap-4">
                                        <div 
                                          onClick={() => toggleTask(day, subject, action)}
                                          className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${isChecked ? 'bg-green-500 border-green-500 scale-110' : 'border-white/30 hover:border-purple-400'}`}
                                        >
                                          {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                                        </div>
                                        <span className={`flex items-center gap-3 transition-all ${isChecked ? 'opacity-70' : 'opacity-100'}`}>
                                          <span className="text-2xl">{getIcon(action)}</span>
                                          <span>{action}</span>
                                        </span>
                                      </div>
                                      <span className={`text-purple-300 font-medium ${isChecked ? 'opacity-70' : ''}`}>{mins}m</span>
                                    </li>
                                  );
                                })}
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
              }) : (
                <div className="col-span-full text-center text-white/70 text-lg">
                  No timetable data available.
                </div>
              )}
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