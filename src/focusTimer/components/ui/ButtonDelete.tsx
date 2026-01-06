export default function ButtonDelete({
  onClick,
  children,
  className = "",
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xs text-sm text-white bg-red-900 hover:bg-red-800 cursor-pointer transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
