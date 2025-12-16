// components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
};

export default function BackButton({ label = "Back" }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        inline-flex items-center gap-2
        text-sm font-medium
        px-4 py-2
        rounded-full
        border border-gray-300
        bg-white
        hover:bg-gray-50
        transition
      "
      type="button"
    >
      ← {label}
    </button>
  );
}
