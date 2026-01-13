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
        bg-blue-50
        text-blue-600
        px-4
        py-1.5
        rounded-full
        text-xs
        font-medium
        border
        border-blue-200
        hover:bg-blue-100
        hover:border-blue-300
        transition
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}
