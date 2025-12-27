import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

/* ---------- Auth Status Component ---------- */
function AuthStatus() {
  const { user, login, logout, authloading } = useAuth();

  if (authloading) {
    return <p className="text-white mt-6">Checking authentication...</p>;
  }

  if (user) {
    return (
      <div className="mt-6 text-white">
        <p className="mb-4 text-white/90">
          Signed in as <span className="font-semibold">{user.displayName}</span>
        </p>

        <div className="flex gap-4">
          {/* Logout Button */}
          <motion.button
            onClick={logout}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 18px rgba(239,68,68,0.8)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-red-600 px-5 py-2 rounded-lg font-medium"
          >
            Logout
          </motion.button>

          {/* Start Planning Button */}
          <Link href="/planner">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 18px rgba(255,255,255,0.35)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="border border-white px-6 py-2 rounded-lg font-medium"
            >
              Start Planning
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  /* Sign In Button */
  return (
    <motion.button
      onClick={login}
      whileHover={{
        scale: 1.07,
        boxShadow: "0px 0px 20px rgba(59,130,246,0.9)",
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="mt-6 bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold"
    >
      Sign in with Google
    </motion.button>
  );
}

/* ---------- Home Page ---------- */
export default function Home() {
  return (
    <motion.div
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/b1.jpg')" }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-12">
        <motion.div
          className="max-w-xl text-white"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h1
            className="text-5xl font-serif font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome to Study <br /> Planner
          </motion.h1>

          <motion.p
            className="mt-4 text-lg text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Plan your studies smartly and stay consistent.
          </motion.p>

          {/* Auth UI */}
          <AuthStatus />
        </motion.div>
      </div>
    </motion.div>
  );
}
