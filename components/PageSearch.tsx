"use client";

import { useEffect, useState } from "react";

interface Props {
  placeholder: string;
  api: string;
  onResults: (data: any[]) => void;
}

export default function PageSearch({ placeholder, api, onResults }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      onResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`${api}?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      onResults(data.results || []);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="mb-6">
      <div className="relative w-full">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="
            w-full
            h-11
            px-5
            text-sm
            border
            border-gray-300
            rounded-full
            bg-white
            focus:outline-none
            focus:ring-2
            focus:ring-[#5b5ce2]
            focus:border-[#5b5ce2]
          "
        />

        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            …
          </span>
        )}
      </div>
    </div>
  );
}
