export default function Hero() {
  return (
    <section className="text-center">
      <h1 className="text-5xl font-bold mb-6">
        AI Resume Analyzer
      </h1>

      <p className="text-xl text-gray-300 mb-8">
        Upload your resume and receive ATS scores,
        skill analysis, resume summary, and AI-powered recommendations.
      </p>

      <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold">
        Upload Resume
      </button>
    </section>
  );
}