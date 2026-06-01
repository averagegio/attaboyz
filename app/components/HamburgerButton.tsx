"use client";

type HamburgerButtonProps = {
  open: boolean;
  onClick: () => void;
};

export function HamburgerButton({ open, onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <span className="relative block h-4 w-5" aria-hidden>
        <span
          className={[
            "absolute left-0 top-0 h-[2px] w-full rounded-full bg-white shadow-[0_0_8px_rgba(0,240,255,0.45)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "top-[7px] rotate-45" : "group-hover:translate-y-[1px]",
          ].join(" ")}
        />
        <span
          className={[
            "absolute left-0 top-[7px] h-[2px] w-full rounded-full bg-white shadow-[0_0_8px_rgba(255,0,170,0.35)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "scale-x-0 opacity-0" : "group-hover:scale-x-90",
          ].join(" ")}
        />
        <span
          className={[
            "absolute left-0 top-[14px] h-[2px] w-full rounded-full bg-white shadow-[0_0_8px_rgba(0,240,255,0.45)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "top-[7px] -rotate-45" : "group-hover:-translate-y-[1px]",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
