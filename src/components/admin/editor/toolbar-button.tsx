"use client";

export default function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection focused
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-30 ${
        active
          ? "bg-accent text-white"
          : "text-ink-700 hover:bg-paper-100 dark:text-paper-100 dark:hover:bg-ink-800"
      }`}
    >
      {children}
    </button>
  );
}
