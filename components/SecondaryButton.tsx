import React from "react";

export default function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`
        bg-[#f3f1ff]
        text-[#5b5ce2]
        px-4
        py-1.5
        rounded-full
        text-xs
        font-medium
        border
        border-[#d9d6ff]
        hover:bg-[#ebe9ff]
        hover:border-[#bdb8ff]
        transition
        ${className}
      `}
    >
      {children}
    </button>
  );
}
