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

const MOTIVATIONAL_QUOTES = [
  "Small steps every day forge the path to massive breakthroughs.",
  "Consistency creates the momentum that intensity can never match.",
  "Build a life today that your future self will be proud to inherit.",
  "Do not work until you are tired; work until you are finished.",
  "Do not let the fear of a long journey prevent you from taking the first step.",
];

export default function PlannerResult() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [plan, setPlan] = useState<any>(null);
  const [timetableByDate, setTimetableByDate] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [planName, setPlanName] = useState("My Study Plan");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "studyPlans", id as string));
      if (snap.exists()) {
        const data = snap.data();
        setPlan(data.plan);
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
    if (!user) {
      setSaveStatus("Please sign in to save plans.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "plans"), {
        name: planName,
        originalPlanId: id,
        timetableByDate,
        createdAt: serverTimestamp(),
      });
      setSaveStatus("Plan saved successfully!");
      setShowSaveInput(false);
    } catch {
      setSaveStatus("Failed to save plan.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Loading your study plan...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Plan not found.
      </div>
    );
  }

  return (
 <div
  className="min-h-screen text-white p-4 md:p-8"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url('/b1.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  }}
>
      <div className="max-w-6xl mx-auto mb-8 flex justify-end">
        {!showSaveInput ? (
          <button
            onClick={() => setShowSaveInput(true)}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium"
          >
            Save Plan
          </button>
        ) : (
          <div className="flex gap-3 items-center">
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white"
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        )}
        {saveStatus && <p className="ml-4 text-green-400">{saveStatus}</p>}
      </div>


      <h1 className="text-4xl font-bold text-center mb-8">
        Your Study Plan
      </h1>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="rounded-xl bg-purple-600/20 backdrop-blur-md border border-purple-400/30 p-4 text-center italic text-purple-100 shadow-lg">
          "{quote}"
        </div>
      </div>


      <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
        {Object.entries(timetableByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, tasks]) => (
            <div
              key={date}
              className="
                rounded-2xl
                bg-white/15
                backdrop-blur-xl
                border border-white/25
                shadow-[0_8px_32px_rgba(0,0,0,0.45)]
                p-6
                transition
                hover:bg-white/20
                hover:scale-[1.015]
              "
            >
              <h2 className="text-2xl font-semibold mb-4 border-b border-white/20 pb-2">
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <ul className="space-y-3">
                {tasks.map((task, i) => (
                  <li key={i} className="flex gap-3 text-white/90">
                    <span className="text-purple-400 mt-1">✦</span>
                    <span className="text-lg leading-snug font-medium">
                      {task}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {user && (
        <div className="mt-12 text-center">
          <Link href="/my-plans">
            <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold shadow-lg">
              ← My Plans
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
