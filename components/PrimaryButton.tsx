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
        bg-indigo-600
        text-white
        px-5
        py-2.5
        rounded-full
        text-sm
        font-medium
        hover:bg-indigo-700
        transition
        shadow-sm
        ${className}
      `}
    >
      {children}
    </button>
  );
}
