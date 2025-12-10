export default function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`
        bg-[#f4e5c2]
        text-[#a87612]
        px-4
        py-1.5
        rounded-full
        text-xs
        font-medium
        border
        border-[#dbb773]
        hover:bg-[#e9d7aa]
        transition
        ${className}
      `}
    >
      {children}
    </button>
  );
}
