import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  "The ink of the scholar is more sacred than the blood of the martyr.",
  "Education is the only armor you wear that grows stronger with every battle.",
  "Do not pray for an easy life; pray for the strength to endure a difficult one.",
  "The roots of education are bitter, but the fruit is sweeter than anything you can imagine.",
  "Your mind is a garden; if you do not plant flowers of knowledge, weeds of regret will grow.",
  "The pain of discipline weighs ounces, but the pain of regret weighs tons.",
  "True mastery is born in the quiet hours when the rest of the world is sleeping.",
  "Every page turned is a brick laid in the fortress of your future empire.",
  "Success is not a destination, but the stamina to keep climbing when your legs are heavy.",
  "Let the curiosity of today become the expertise of tomorrow.",
  "The world does not pay you for what you know; it pays you for what you can do with what you know.",
  "Greatness is not a sudden spark; it is the steady burn of a thousand focused hours.",
  "Your potential is a boundless ocean; do not be afraid to leave the shallow shore of comfort.",
  "Knowledge is the only wealth that increases when you share it and cannot be stolen.",
  "The struggle you are in today is developing the strength you need for tomorrow's victory.",
  "Do not let the fear of a long journey prevent you from taking the first magnificent step.",
  "The difference between a dreamer and a doer is the courage to begin without seeing the end.",
  "Excellence is not an accident; it is the result of high intention and sincere effort.",
  "Focus your energy like a laser; a scattered light cannot cut through the darkness of ignorance.",
  "Your future is being written in the margins of your notebooks right now.",
  "Do not settle for being a spectator in your own life; be the architect of your destiny.",
  "The library is a portal to a thousand lives; choose to live them all through your studies.",
  "Comfort is the enemy of growth; seek the challenge that makes your mind expand.",
  "Silence the noise of the world so you can hear the whispers of your own ambition.",
  "The harder the conflict, the more glorious the triumph that awaits you at the finish line.",
  "An investment in your own intellect pays the highest dividends for the rest of your life.",
  "Do not work until you are tired; work until you are finished and your soul is satisfied.",
  "The only limits that exist are the ones you choose to believe in.",
  "Your brain is a muscle that thrives on the weight of difficult problems.",
  "Wisdom is the reward for a lifetime of listening when you would have preferred to talk.",
  "Let your work speak so loudly that you don't have to utter a single word of boast.",
  "The climb may be steep, but the view from the summit is reserved for those who did not quit.",
  "Be the person who can find a way when everyone else is looking for an excuse.",
  "Success belongs to those who are willing to do what others are too lazy to attempt.",
  "Your destiny is not a matter of chance; it is a matter of the choices you make today.",
  "A mind stretched by a new idea never returns to its original dimensions.",
  "The quiet discipline of a student is the foundation of a leader’s public roar.",
  "Don't study to pass an exam; study to understand the world and change it.",
  "A thousand-mile journey begins with the resolve to never look back.",
  "Your ambition should be so large that it makes your current self uncomfortable.",
  "Grit is the bridge between the dream in your heart and the reality in your hands.",
  "Be so good at what you do that they cannot afford to ignore your presence.",
  "The seeds of greatness are watered by the sweat of your daily persistence.",
  "To master your craft is to honor the gifts that the universe gave you.",
  "Stop waiting for the perfect moment; take the moment and make it perfect through work.",
  "The man who moves a mountain begins by carrying away small stones.",
  "Light the fire of your purpose and let it guide you through the darkest nights of doubt.",
  "When you feel like quitting, remember why you started this magnificent journey.",
  "Every expert was once a beginner who refused to give up during the struggle.",
  "Your focus is your greatest currency; spend it wisely on things that build your future.",
  "Character is what you do when the deadline is far and nobody is watching.",
  "The only person you should strive to be better than is the person you were yesterday.",
  "Great things never came from comfort zones; they came from the fires of challenge.",
  "Success is the sum of small efforts, repeated day in and day out without fail.",
  "Don’t count the days; make the days count by filling them with meaningful progress.",
  "The secret of your future is hidden in your daily routine.",
  "You are not studying for a grade; you are studying for the power to serve others.",
  "Opportunities are usually disguised as hard work, so most people don't recognize them.",
  "The price of greatness is responsibility over your own time and mind.",
  "Act as if what you do makes a difference, because it absolutely does.",
  "The best way to predict your future is to create it with your own two hands.",
  "Believing in yourself is the first secret to unlocking every door you encounter.",
  "Don't watch the clock; do what it does and keep moving forward with purpose.",
  "Your talent will get you in the door, but your character will keep you in the room.",
  "The more you learn, the less you fear the unknown.",
  "Persistence is the twin sister of excellence; one is a matter of quality, the other a matter of time.",
  "If you want to shine like the sun, first you must burn with the passion of your work.",
  "There are no shortcuts to any place worth going; the long road builds the strongest soul.",
  "A year from now, you will wish you had started today.",
  "Your imagination is the preview of life's coming attractions; feed it with knowledge.",
  "Life is 10% what happens to you and 90% how you respond to the challenge.",
  "Make your life a masterpiece; you only have one canvas and a limited amount of time.",
  "The only real failure is the failure to try again after a setback.",
  "Success is liking yourself, liking what you do, and liking how you do it.",
  "Be a student as long as you still have something to learn, and that will be all your life.",
  "The horizon is only the limit of our sight; go beyond what others think is possible.",
  "Strength does not come from winning; it comes from the struggles that develop your will.",
  "Do what is right, not what is easy; the easy path leads to a crowded destination.",
  "Your life is your message to the world; make sure it is inspiring and profound.",
  "Focus on being productive instead of being busy; movement is not always progress.",
  "The way to get started is to quit talking and begin doing.",
  "You don't have to be great to start, but you have to start to be great.",
  "Your brain is the most powerful tool in existence; learn to wield it with precision.",
  "Turn your wounds into wisdom and your obstacles into stepping stones.",
  "Success is the ability to go from one failure to another without loss of enthusiasm.",
  "Keep your eyes on the stars and your feet firmly planted on the ground of reality.",
  "The only thing standing between you and your goal is the story you keep telling yourself.",
  "Whatever you are, be a good one; whatever you do, do it with your whole heart.",
  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
  "You were born to leave a mark, not just to exist. Pick up your pen and start writing."
];

export default function PlannerResult() {
  const router = useRouter();
  const { id } = router.query;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      const docRef = doc(db, "studyPlans", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPlan(docSnap.data().plan);

        const randomIndex = Math.floor(
          Math.random() * MOTIVATIONAL_QUOTES.length
        );
        setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
      }

      setLoading(false);
    };

    fetchPlan();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0a0a]">
        Loading your study plan...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0a0a]">
        Plan not found.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('/b1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
      className="text-white p-4 md:p-8"
    >
      {/* -------- Title -------- */}
      <h1 className="text-4xl font-bold text-center mb-8 drop-shadow-lg">
        Your Study Plan
      </h1>

      {/* -------- Quote -------- */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="rounded-xl bg-purple-600/20 backdrop-blur-md border border-purple-400/30 p-4 text-center italic text-purple-100 shadow-lg">
          "{quote}"
        </div>
      </div>

      {/* -------- Timetable -------- */}
      <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
        {Object.entries(plan.timetable)
          .sort(([a], [b]) => {
            const dayA = Number(a.replace("Day ", ""));
            const dayB = Number(b.replace("Day ", ""));
            return dayA - dayB;
          })
          .map(([day, tasks]: any) => (
            <div
              key={day}
              className="rounded-2xl bg-white/10 backdrop-blur-lg p-6 border border-white/20 shadow-2xl transition-transform hover:scale-[1.02]"
            >
              <h2 className="text-2xl font-bold mb-4 text-white border-b border-white/10 pb-2">
                {day}
              </h2>

              <ul className="space-y-3">
                {tasks.map((task: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-white/90">
                    <span className="text-purple-400 mt-1">✦</span>
                    <span className="text-lg leading-tight font-medium">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {/* -------- Study Tips -------- */}
      {plan.tips && (
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold mb-4 text-purple-200">
            Expert Study Tips
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            {plan.tips.map((tip: string, i: number) => (
              <li key={i} className="flex gap-2 text-white/80 italic">
                <span>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}