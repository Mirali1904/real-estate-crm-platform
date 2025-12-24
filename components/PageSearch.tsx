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
    if (!q) {
      onResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`${api}?q=${q}`);
      const data = await res.json();
      onResults(data.results || []);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="mb-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full max-w-md px-4 py-2 border rounded-lg"
      />
      {loading && (
        <p className="text-sm text-gray-500 mt-1">Searching...</p>
      )}
    </div>
  );
}
