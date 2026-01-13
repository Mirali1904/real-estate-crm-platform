import React from "react";

export default function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`
        bg-blue-600
        text-white
        px-5
        py-2.5
        rounded-full
        text-sm
        font-medium
        hover:bg-blue-700
        transition
        shadow-sm
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}
