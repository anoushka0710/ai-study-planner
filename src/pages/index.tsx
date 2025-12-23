import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/b1.jpg')" }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

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
            transition={{ duration: 0.6 }}
          >
            Welcome to Study <br /> Planner
          </motion.h1>

          <motion.p
            className="mt-4 text-lg text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Plan your studies smartly and stay consistent.
          </motion.p>

          <Link href="/planner">
            <motion.button
              className="mt-8 rounded-md border border-white px-6 py-3 text-white"
              whileHover={{
                scale: 1.05,
                backgroundColor: "#ffffff",
                color: "#000000",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Start Planning
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
