import Link from "next/link";
// this is the home page
export default function Home() {
  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg2.webp')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-12">
        <div className="max-w-xl text-white">
          <h1 className="text-5xl font-serif font-bold leading-tight">
            Welcome to Study <br /> Planner
          </h1>

          <p className="mt-4 text-lg text-gray-200">
            Plan your studies smartly and stay consistent.
          </p>

          <Link href="/planner">
            <button className="mt-8 rounded-md border border-white px-6 py-3 text-white transition hover:bg-white hover:text-black">
              Start Planning
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
