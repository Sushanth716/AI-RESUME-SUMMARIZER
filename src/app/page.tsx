import ResumeAnalyzer from "../features/resume-upload/resume-analyzer/ResumeAnalyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <ResumeAnalyzer />
    </main>
  );
}