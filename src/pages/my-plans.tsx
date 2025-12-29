import { useAuth } from "@/context/AuthContext";
import {collection,query,orderBy,getDocs,deleteDoc,doc,} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyPlans() {
  const { user, authloading } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPlans = async () => {
      const q = query(
        collection(db, "users", user.uid, "plans"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setPlans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchPlans();
  }, [user]);

  const handleDelete = async (planId: string) => {
    if (!user) return;

    const ok = confirm("Are you sure you want to delete this plan?");
    if (!ok) return;

    await deleteDoc(doc(db, "users", user.uid, "plans", planId));
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  if (authloading || loading) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Please sign in to view your plans.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black/90 text-white p-4 md:p-8"
      style={{
        backgroundImage: "url('/b1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
     
      <h1 className="text-4xl font-bold text-center mb-8">
        My Saved Plans
      </h1>

      {plans.length === 0 ? (
        <p className="text-center text-white/70">
          No saved plans yet!
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.id}
              className="relative rounded-2xl bg-white/10 backdrop-blur-lg p-6 border border-white/20 shadow-2xl hover:scale-[1.02] transition"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p.id);
                }}
                className="absolute top-3 right-3 text-white/70 hover:text-red-400 text-xl font-bold"
                title="Delete plan"
              >
                ×
              </button>

              {p.originalPlanId ? (
                <Link href={`/planner/${p.originalPlanId}`}>
                  <div className="cursor-pointer">
                    <h2 className="text-2xl font-bold mb-2">
                      {p.name}
                    </h2>
                    <p className="text-white/60">
                      Created:{" "}
                      {p.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {p.name}
                  </h2>
                  <p className="text-white/60">
                    Created:{" "}
                    {p.createdAt?.toDate().toLocaleDateString()}
                  </p>
                  <p className="text-red-400 text-sm mt-2">
                    Plan link unavailable
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-20 flex justify-center">
  <Link href="/planner">
    <button className="bg-purple-600 hover:bg-purple-700 px-10 py-4 rounded-xl text-white font-semibold shadow-xl transition">
      ← Back to Planner
    </button>
  </Link>
</div>
    </div>
  );
}
