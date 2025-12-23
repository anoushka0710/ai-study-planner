import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PlannerResult() {
  const router = useRouter();
  const { id } = router.query;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      const docRef = doc(db, "studyPlans", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPlan(docSnap.data().plan);
      }

      setLoading(false);
    };

    fetchPlan();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <p>Loading your study plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-10 text-center">
        <p>Plan not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Your Study Plan
      </h1>

      {/* Timetable */}
      <div className="grid gap-6 md:grid-cols-2">
   {Object.entries(plan.timetable)
  .sort(([a], [b]) => {
    const dayA = Number(a.replace("Day ", ""));
    const dayB = Number(b.replace("Day ", ""));
    return dayA - dayB;
  })
  .map(([day, tasks]: any) => (
            <div
              key={day}
              className="rounded-xl bg-white/10 p-6 border border-white/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                {day}
              </h2>

              <ul className="space-y-2">
                {tasks.map((task: string, index: number) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {/* Tips */}
      {plan.tips && (
        <div className="mt-10 max-w-2xl mx-auto rounded-lg bg-purple-600/20 p-5">
          <h3 className="text-lg font-semibold mb-3 text-purple-200">
            Study Tips
          </h3>
          <ul className="list-disc pl-6">
            {plan.tips.map((tip: string, i: number) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
