/**
 * A small spinner for busy buttons. It inherits the text color. With reduced motion it does not
 * spin, and it pulses its opacity instead, so the busy state is still visible.
 */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`size-[18px] flex-none motion-safe:animate-spin motion-reduce:animate-pulse ${className}`}
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
