import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const saveTestData = async () => {
    try {
      await addDoc(collection(db, "test"), {
        message: "Firebase connected!",
        createdAt: new Date(),
      });
      alert("Firebase write successful!");
    } catch (error) {
      console.error(error);
      alert("Firebase write failed");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Firebase Test</h1>
      <button onClick={saveTestData}>
        Test Firebase
      </button>
    </div>
  );
}