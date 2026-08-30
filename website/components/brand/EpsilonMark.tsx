import React from "react";

type EpsilonMarkProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export default function EpsilonMark({ title = "EPSILON", ...props }: EpsilonMarkProps) {
  return (
    <svg viewBox="0 0 40 24" fill="none" role="img" aria-label={title} {...props}>
      <path d="M3 12h34" stroke="currentColor" strokeWidth="1" opacity="0.32" />
      <path d="M4 16.5c5.8 0 7.2-9 13-9s7.2 9 13 9c2.3 0 4.2-1.4 6-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="7.5" r="1.7" fill="currentColor" />
      <circle cx="30" cy="16.5" r="1.7" fill="currentColor" />
    </svg>
  );
}
