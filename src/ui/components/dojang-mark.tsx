export function DojangMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid size-10 shrink-0 rotate-[-4deg] place-items-center rounded-full bg-lacquer font-myeongjo text-lacquer-ink shadow-[inset_0_0_0_2px_var(--lacquer),inset_0_0_0_3.5px_var(--lacquer-ink)] ${className}`}
    >
      <span className="vertical-text text-[0.95rem] leading-[1.05] font-extrabold">읽다</span>
    </span>
  );
}
