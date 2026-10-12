
"use client";

import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8">
      <h1 className="mb-6 text-4xl font-bold">
        Counter App
      </h1>

      <p className="mb-6 text-6xl font-bold text-blue-400">
        {count}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => setCount(count - 1)}
          className="rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
        >
          Decrease
        </button>

        <button
          onClick={() => setCount(0)}
          className="rounded-lg bg-slate-600 px-6 py-3 font-semibold hover:bg-slate-700"
        >
          Reset
        </button>

        <button
          onClick={() => setCount(count + 2)}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Increase
        </button>
      </div>
    </main>
  );
}