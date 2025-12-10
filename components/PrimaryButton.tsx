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
        bg-[#c89a3b] 
        text-white 
        px-4 
        py-2 
        rounded-full 
        text-sm 
        font-medium 
        hover:bg-[#b18332] 
        transition 
        shadow-sm
        ${className}
      `}
    >
      {children}
    </button>
  );
}
