export default function AboutPage() {
    return (
          <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        About Me
      </h1>

      <p className="text-slate-300 text-lg">
        I am learning Next.js!
      </p>

      <a
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-700"
      >
        Back to Home
      </a>
    </main>
    );
}