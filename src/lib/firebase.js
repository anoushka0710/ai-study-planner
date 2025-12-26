// Import the functions you need from the SDKs you need
import { initializeApp,getApps,getApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGyA60k54Dp4JoM2eHl9z0-IpSECDIkMU",
  authDomain: "ai-study-planner-d2b28.firebaseapp.com",
  projectId: "ai-study-planner-d2b28",
  storageBucket: "ai-study-planner-d2b28.firebasestorage.app",
  messagingSenderId: "812337044236",
  appId: "1:812337044236:web:a2c2888a6202b827bd8729"
};

// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db=getFirestore(app);
export const auth = getAuth(app);